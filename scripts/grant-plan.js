import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function grantPlan(email, plan) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing Supabase env. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.')
    process.exit(1)
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: users, error: listErr } = await supabase.auth.admin.listUsers()
  if (listErr) {
    console.error('Error listing users:', listErr)
    process.exit(1)
  }

  const user = users?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase())
  if (!user) {
    console.error('User not found:', email)
    process.exit(1)
  }

  const { error: upsertErr } = await supabase
    .from('subscriptions')
    .upsert({
      user_id: user.id,
      plan,
      status: 'active',
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    })

  if (upsertErr) {
    console.error('Upsert error:', upsertErr)
    process.exit(1)
  }

  console.log(`Granted plan "${plan}" to ${email} (${user.id})`)
}

const email = process.argv[2]
const plan = process.argv[3] || 'agency'
grantPlan(email, plan)
