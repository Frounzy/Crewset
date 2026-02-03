import { PaymentProvider, CheckoutSessionParams, CheckoutSessionResult } from '../types'
import { stripe } from '@/lib/stripe/server'
import { createAdminClient } from '@/lib/supabase/admin'

export class StripeProvider implements PaymentProvider {
  async createCheckoutSession(params: CheckoutSessionParams): Promise<CheckoutSessionResult> {
    const { user, items } = params
    
    // Use the first item's priceId for subscription
    const priceId = items[0]?.priceId
    
    if (!priceId) {
        throw new Error('Price ID is required for Stripe subscription')
    }

    const supabase = createAdminClient()
    const { data: subscription } = await supabase
        .from('subscriptions')
        .select('stripe_customer_id')
        .eq('user_id', user.id)
        .single()
    
    const customerId = subscription?.stripe_customer_id

    const session = await stripe.checkout.sessions.create({
        customer: customerId || undefined,
        customer_email: customerId ? undefined : user.email,
        line_items: [
            {
                price: priceId,
                quantity: 1,
            },
        ],
        mode: 'subscription',
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
        metadata: {
            user_id: user.id,
            plan_slug: items[0]?.id,
        },
        subscription_data: {
            metadata: {
                user_id: user.id,
                plan_slug: items[0]?.id
            }
        }
    })

    if (!session.url) {
        throw new Error('Failed to create Stripe session URL')
    }

    return {
        url: session.url,
        provider: 'stripe'
    }
  }

  async verifyPayment(token: string): Promise<{ success: boolean; paymentId?: string; raw?: any }> {
      // For Stripe, token is session_id
      try {
          const session = await stripe.checkout.sessions.retrieve(token)
          // For subscription mode, payment_status might be 'paid' or status 'complete'
          // session.status can be 'open', 'complete', 'expired'
          if (session.status === 'complete' || session.payment_status === 'paid') {
               return {
                   success: true,
                   paymentId: session.subscription as string,
                   raw: session
               }
          }
          return { success: false, raw: session }
      } catch (err) {
          return { success: false, raw: err }
      }
  }
}
