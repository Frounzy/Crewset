import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/security/logger'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id, plan, current_period_end')
      .eq('user_id', user.id)
      .single()

    if (!subscription?.stripe_customer_id) {
      return new NextResponse('No subscription found', { status: 404 })
    }

    // Check if it's an Iyzico subscription (manual period)
    if (subscription.stripe_customer_id.startsWith('iyz_')) {
        const expiryDate = subscription.current_period_end 
            ? new Date(subscription.current_period_end)
            : null
            
        const daysLeft = expiryDate 
            ? Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
            : 0

        if (expiryDate && daysLeft <= 3) {
            return NextResponse.json({ 
                message: `Your subscription expires in ${daysLeft} days. Please go back and select a plan to renew.` 
            })
        }

        const expiryString = expiryDate ? expiryDate.toLocaleDateString('tr-TR') : 'Unknown'

        return NextResponse.json({ 
            message: `Your ${subscription.plan} plan is active until ${expiryString}. No action is needed.` 
        })
    }

    // Otherwise, assume Stripe and create Portal Session
    try {
        const session = await stripe.billingPortal.sessions.create({
            customer: subscription.stripe_customer_id,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
        })
        return NextResponse.json({ url: session.url })
    } catch (stripeError: any) {
        logger.error('Stripe Portal Error', user.id, { error: stripeError.message })
        // If Stripe fails (maybe customer deleted in Stripe but exists in DB), fallback to message
        return NextResponse.json({ 
             message: 'Could not access billing portal. Please contact support.' 
        })
    }

  } catch (err: any) {
    console.error('Portal Error:', err)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
