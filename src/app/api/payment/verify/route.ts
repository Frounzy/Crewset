import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPaymentProvider } from '@/lib/payment/service'
import { stripe } from '@/lib/stripe/server'
import { logger } from '@/lib/security/logger'

export async function GET(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(req.url)
  const sessionId = url.searchParams.get('session_id')

  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })
  }

  try {
    const provider = getPaymentProvider()
    const verification = await provider.verifyPayment(sessionId)

    let sessionRaw: any = verification.raw
    if (!sessionRaw) {
      try {
        sessionRaw = await stripe.checkout.sessions.retrieve(sessionId)
      } catch {}
    }
    const sessionCustomer = sessionRaw?.customer as string | undefined
    const sessionUserId = sessionRaw?.metadata?.user_id as string | undefined

    if (sessionUserId && sessionUserId !== user.id) {
      logger.warn('Verify mismatch: session user_id differs from current user', user.id, { sessionUserId })
      // Continue but log for visibility
    }

    let subscriptionId = verification.paymentId as string | undefined
    let subscription: any

    if (!subscriptionId) {
      // Fallback: subscription may not be immediately attached to the session object.
      // Find by customer and take the latest non-canceled subscription.
      if (!sessionCustomer) {
        // Second fallback: infer plan from line items
        try {
          const items = await stripe.checkout.sessions.listLineItems(sessionId, { limit: 1 })
          const priceIdFromItem = items.data[0]?.price?.id
          let inferredPlan: 'free' | 'pro' | 'agency' = 'free'
          if (priceIdFromItem === process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID) {
            inferredPlan = 'pro'
          } else if (priceIdFromItem === process.env.NEXT_PUBLIC_STRIPE_AGENCY_PRICE_ID) {
            inferredPlan = 'agency'
          }
          if (inferredPlan !== 'free') {
            const admin = createAdminClient()
            const { error } = await admin
              .from('subscriptions')
              .upsert({
                user_id: user.id,
                stripe_customer_id: sessionRaw?.customer as string | null,
                plan: inferredPlan,
                status: 'active',
                current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              }, { onConflict: 'user_id' })
            if (error) {
              logger.error('Supabase upsert error in line_items fallback', user.id, { error: error.message })
              return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
            }
            return NextResponse.json({ success: true, plan: inferredPlan })
          }
        } catch (e: any) {
          logger.warn('Line items fallback failed', user.id, { error: e.message })
        }
        return NextResponse.json({ success: false })
      }
      const list = await stripe.subscriptions.list({
        customer: sessionCustomer,
        status: 'all',
        limit: 5
      })
      const candidate = list.data.find(s => s.status !== 'canceled') || list.data[0]
      if (!candidate) {
        return NextResponse.json({ success: false })
      }
      subscriptionId = candidate.id
      subscription = candidate
    } else {
      subscription = await stripe.subscriptions.retrieve(subscriptionId)
    }

    if (!subscription || ['incomplete', 'canceled'].includes(subscription.status)) {
      return NextResponse.json({ success: false })
    }

    let plan: 'free' | 'pro' | 'agency' = 'free'
    const sessionPlanSlug = sessionRaw?.metadata?.plan_slug as string | undefined
    if (sessionPlanSlug === 'pro') {
      plan = 'pro'
    } else if (sessionPlanSlug === 'agency') {
      plan = 'agency'
    }
    const priceId = subscription.items.data[0]?.price?.id
    if (plan === 'free') {
      if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID) {
        plan = 'pro'
      } else if (priceId === process.env.NEXT_PUBLIC_STRIPE_AGENCY_PRICE_ID) {
        plan = 'agency'
      }
    }

    const admin = createAdminClient()
    const { error } = await admin
      .from('subscriptions')
      .upsert({
        user_id: user.id,
        stripe_subscription_id: subscriptionId,
        stripe_customer_id: sessionCustomer || (subscription.customer as string),
        plan,
        status: subscription.status as any,
        current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
      }, { onConflict: 'user_id' })
    if (error) {
      logger.error('Supabase upsert error on verify', user.id, { error: error.message })
      return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
    }

    logger.info('Payment verified and subscription updated', user.id, { plan, subscriptionId })
    return NextResponse.json({ success: true, plan })
  } catch (err: any) {
    logger.error('Payment verify error', user.id, { error: err.message })
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
