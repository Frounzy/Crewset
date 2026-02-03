import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/security/logger'
import Stripe from 'stripe'

export async function POST(req: Request) {
  const body = await req.text()
  const signature = (await headers()).get('Stripe-Signature') as string

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
      logger.critical('Missing STRIPE_WEBHOOK_SECRET in environment variables');
      return new NextResponse('Server Configuration Error', { status: 500 });
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (error: any) {
    logger.error(`Webhook signature verification failed: ${error.message}`, undefined, { ip: (await headers()).get('x-forwarded-for') });
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
  }

  const supabase = createAdminClient()

  try {
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session
        if (!session?.metadata?.user_id) {
            logger.error('Webhook Error: user_id missing in session metadata', undefined, { sessionId: session.id });
            return new NextResponse('User id is required', { status: 400 });
        }
    
        const subscriptionId = session.subscription as string
    
        // Retrieve the subscription details from Stripe
        const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId)
    
        // Map price ID to plan name
        let plan: 'free' | 'pro' | 'agency' = 'free'
        const priceId = stripeSubscription.items.data[0].price.id
        if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID) {
            plan = 'pro'
        } else if (priceId === process.env.NEXT_PUBLIC_STRIPE_AGENCY_PRICE_ID) {
            plan = 'agency'
        }
    
        await supabase
          .from('subscriptions')
          .upsert({
            user_id: session.metadata.user_id,
            stripe_subscription_id: subscriptionId,
            stripe_customer_id: session.customer as string,
            plan: plan,
            status: stripeSubscription.status,
            current_period_end: new Date(
                (stripeSubscription as any).current_period_end * 1000
            ).toISOString(),
          }, { onConflict: 'user_id' })

        logger.info('Subscription created successfully', session.metadata.user_id, { plan, subscriptionId })
      }
    
      if (event.type === 'customer.subscription.updated') {
        const subscription = event.data.object as Stripe.Subscription
        // Retrieve the subscription details from Stripe to be safe
        const stripeSubscription = await stripe.subscriptions.retrieve(subscription.id)
    
        // Map price ID to plan name
        let plan: 'free' | 'pro' | 'agency' = 'free'
        const priceId = stripeSubscription.items.data[0].price.id
        if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID) {
            plan = 'pro'
        } else if (priceId === process.env.NEXT_PUBLIC_STRIPE_AGENCY_PRICE_ID) {
            plan = 'agency'
        }
        
        // We need to find the user_id for this subscription
        // If we stored it in metadata during checkout, it should be there. 
        // If not, we might need to look it up by stripe_customer_id in our DB.
        
        // Ideally we put user_id in subscription metadata too
        const subscriptionMetadata = subscription.metadata;
        let userId = subscriptionMetadata?.user_id
        
        if (!userId) {
            // Fallback: look up by customer_id
            const { data: sub } = await supabase
                .from('subscriptions')
                .select('user_id')
                .eq('stripe_customer_id', subscription.customer as string)
                .single()
            userId = sub?.user_id
        }

        if (userId) {
             await supabase
                .from('subscriptions')
                .upsert({
                    user_id: userId,
                    stripe_subscription_id: subscription.id,
                    stripe_customer_id: subscription.customer as string,
                    plan: plan,
                    status: subscription.status,
                    current_period_end: new Date(
                        (subscription as any).current_period_end * 1000
                    ).toISOString(),
                }, { onConflict: 'user_id' })
             logger.info('Subscription updated', userId, { status: subscription.status })
        }
      }

      if (event.type === 'invoice.payment_failed') {
          const invoice = event.data.object as Stripe.Invoice
          const subscriptionId = (invoice as any).subscription as string
          const customerId = invoice.customer as string

          // Find user by subscription or customer
          const { data: sub } = await supabase
             .from('subscriptions')
             .select('user_id')
             .or(`stripe_subscription_id.eq.${subscriptionId},stripe_customer_id.eq.${customerId}`)
             .single()
          
          if (sub?.user_id) {
             // We don't change status manually here because Stripe usually sends customer.subscription.updated
             // with status='past_due' immediately after payment failure.
             // But we can log it or send an alert if we want.
             logger.warn('Invoice payment failed', sub.user_id, { invoiceId: invoice.id })
             
             // Optional: You could update a separate "last_payment_status" column if you had one.
          }
      }

      if (event.type === 'customer.subscription.deleted') {
          const subscription = event.data.object as Stripe.Subscription
          
          const { data: sub } = await supabase
             .from('subscriptions')
             .select('user_id')
             .eq('stripe_subscription_id', subscription.id)
             .single()

          if (sub?.user_id) {
             await supabase
                .from('subscriptions')
                .update({ status: 'canceled', plan: 'free' }) // Revert to free or just mark canceled
                .eq('user_id', sub.user_id)
             
             logger.info('Subscription canceled/deleted', sub.user_id, { subscriptionId: subscription.id })
          }
      }
    
  } catch (err: any) {
    logger.error(`Webhook handler failed: ${err.message}`, undefined, { eventType: event?.type })
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 })
  }

  return new NextResponse(null, { status: 200 })
}
