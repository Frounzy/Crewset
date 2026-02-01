import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Resend } from 'resend'
import { parseISO, differenceInCalendarDays, addDays, format } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'

const resend = new Resend(process.env.RESEND_API_KEY)

// Force dynamic to prevent caching of the cron route
export const dynamic = 'force-dynamic'
export const maxDuration = 60 // Allow longer execution time (Vercel Pro)

const BATCH_SIZE = 50

interface Contract {
  id: string
  name: string
  end_date: string
  user_id: string
  value_amount: number
  value_period: string
  client?: { name: string }
  // We'll attach profile manually
  profile?: {
    email: string
    timezone?: string
    notification_settings?: {
      email_enabled: boolean
    }
  }
}

interface ContractActivity {
  contract_id: string
  details: {
    milestone: string
    days: number
    sent_at: string
  }
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const supabase = createAdminClient()
  const now = new Date()
  
  // Optimization: Only fetch contracts ending in the next ~35 days
  // This drastically reduces the dataset compared to "all active contracts"
  // We add a buffer for timezone differences
  const maxDate = addDays(now, 35)
  const minDate = addDays(now, -1) // In case of timezone lag

  const processingResults = {
    processed: 0,
    reminders_sent: 0,
    errors: 0,
    details: [] as any[]
  }

  try {
    let hasMore = true
    let page = 0

    while (hasMore) {
      // 1. Batch Fetch Contracts
      const { data: contracts, error } = await supabase
        .from('contracts')
        .select('*, client:clients(name)')
        .eq('status', 'active')
        .gte('end_date', minDate.toISOString().split('T')[0])
        .lte('end_date', maxDate.toISOString().split('T')[0])
        .range(page * BATCH_SIZE, (page + 1) * BATCH_SIZE - 1)

      if (error) throw error
      if (!contracts || contracts.length === 0) {
        hasMore = false
        break
      }

      // 2. Fetch Profiles (for Timezone & Settings) - Avoiding N+1
      const userIds = Array.from(new Set(contracts.map(c => c.user_id)))
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, timezone, notification_settings')
        .in('id', userIds)

      const profileMap = new Map(profiles?.map(p => [p.id, p]))

      // 3. Fetch Previously Sent Reminders (Idempotency) - Avoiding N+1
      const contractIds = contracts.map(c => c.id)
      const { data: activities } = await supabase
        .from('contract_activities')
        .select('contract_id, details')
        .in('contract_id', contractIds)
        .eq('action', 'reminder_sent')

      const sentMap = new Map<string, Set<string>>()
      activities?.forEach((a: any) => {
        if (!sentMap.has(a.contract_id)) sentMap.set(a.contract_id, new Set())
        if (a.details?.milestone) sentMap.get(a.contract_id)?.add(a.details.milestone)
      })

      // 4. Process Batch in Parallel
      const promises = contracts.map(async (contract: Contract) => {
        try {
          const profile = profileMap.get(contract.user_id)
          
          // Validation: Missing profile or email
          if (!profile || !profile.email) return

          // Feature: Opt-out Check
          if (profile.notification_settings?.email_enabled === false) return

          // Feature: Timezone Aware "Today"
          const userTimezone = profile.timezone || 'UTC'
          const userToday = toZonedTime(new Date(), userTimezone)
          const endDate = parseISO(contract.end_date)
          
          // Calculate difference in calendar days (ignores time of day)
          const daysUntilExpiration = differenceInCalendarDays(endDate, userToday)

          // Determine Milestone
          let milestone: string | null = null
          if (daysUntilExpiration === 30) milestone = '30_days'
          else if (daysUntilExpiration === 7) milestone = '7_days'
          else if (daysUntilExpiration === 1) milestone = '1_day'

          if (!milestone) return // Not a reminder day

          // Feature: Idempotency Check
          if (sentMap.get(contract.id)?.has(milestone)) return // Already sent

          // Send Email
          const { error: emailError } = await resend.emails.send({
            from: 'Crewset <onboarding@resend.dev>',
            to: profile.email,
            subject: `Contract Expiring Soon: ${contract.name}`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Contract Expiring Soon</h2>
                <p>Your contract <strong>${contract.name}</strong> with <strong>${contract.client?.name || 'Unknown Client'}</strong> is set to expire in <strong>${daysUntilExpiration} days</strong>.</p>
                <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
                  <p><strong>End Date:</strong> ${format(endDate, 'PPP')}</p>
                  <p><strong>Value:</strong> ${contract.value_amount} ${contract.value_period}</p>
                </div>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/contracts" style="display: inline-block; background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Contract</a>
              </div>
            `
          })

          if (emailError) throw new Error(`Resend error: ${emailError.message}`)

          // Log Activity (Idempotency Record)
          await supabase.from('contract_activities').insert({
            user_id: contract.user_id,
            contract_id: contract.id,
            action: 'reminder_sent',
            details: { milestone, days: daysUntilExpiration, sent_at: new Date().toISOString() }
          })

          processingResults.reminders_sent++
          processingResults.details.push({ 
            contract: contract.name, 
            user: profile.email, 
            milestone,
            status: 'sent' 
          })

        } catch (err: any) {
          console.error(`Error processing contract ${contract.id}:`, err)
          processingResults.errors++
          processingResults.details.push({ 
            contract: contract.name, 
            error: err.message,
            status: 'failed'
          })
          // Do not throw here; allow other contracts in batch to proceed
        }
      })

      await Promise.allSettled(promises)
      
      processingResults.processed += contracts.length
      page++
    }

    if (process.env.ADMIN_EMAIL) {
      if (processingResults.errors > 0) {
        await resend.emails.send({
          from: 'Crewset System <onboarding@resend.dev>',
          to: process.env.ADMIN_EMAIL,
          subject: `⚠️ Cron Job Errors: ${processingResults.errors} failures`,
          html: `<pre>${JSON.stringify(processingResults, null, 2)}</pre>`
        })
      } else if (processingResults.reminders_sent > 0) {
        await resend.emails.send({
          from: 'Crewset System <onboarding@resend.dev>',
          to: process.env.ADMIN_EMAIL,
          subject: `✅ Cron Job Success: ${processingResults.reminders_sent} reminders sent`,
          html: `<pre>${JSON.stringify(processingResults, null, 2)}</pre>`
        })
      }
    }

    return NextResponse.json({ success: true, ...processingResults })

  } catch (error: any) {
    console.error('Fatal Cron Error:', error)
    
    if (process.env.ADMIN_EMAIL) {
        await resend.emails.send({
            from: 'Crewset System <onboarding@resend.dev>',
            to: process.env.ADMIN_EMAIL,
            subject: `🚨 CRITICAL: Cron Job Failed`,
            html: `<p>Error: ${error.message}</p><pre>${JSON.stringify(processingResults, null, 2)}</pre>`
        })
    }

    return NextResponse.json(
      { error: error.message || 'Internal Server Error', ...processingResults }, 
      { status: 500 }
    )
  }
}
