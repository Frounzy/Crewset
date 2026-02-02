import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/security/logger'
import { checkRateLimit } from '@/lib/security/rate-limit'
import { getPaymentProvider } from '@/lib/payment/service'
import { PLANS } from '@/config/subscriptions'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    logger.warn('Unauthorized checkout attempt')
    return new NextResponse('Unauthorized', { status: 401 })
  }

  // Rate Limiting: 5 checkout attempts per minute per user
  const { success } = await checkRateLimit(`checkout:${user.id}`, 5, 60)
  if (!success) {
      return new NextResponse('Too many checkout attempts. Please try again later.', { status: 429 })
  }

  const body = await req.json()
  const priceId = body.priceId
  
  if (!priceId) {
      return new NextResponse('Price ID required', { status: 400 })
  }

  const plan = PLANS.find(p => p.priceId === priceId)
  if (!plan) {
      return new NextResponse('Invalid Price ID', { status: 400 })
  }

  try {
    const paymentProvider = getPaymentProvider()
    
    // Construct user data for payment provider
    const paymentUser = {
        id: user.id,
        email: user.email!,
        fullName: user.user_metadata?.full_name || user.email,
        ip: (req.headers.get('x-forwarded-for') ?? '127.0.0.1').split(',')[0],
        address: {
             contactName: user.user_metadata?.full_name || user.email || 'Guest',
             city: 'Istanbul', // Default or fetch from user profile if available
             country: 'Turkey',
             address: 'Istanbul, Turkey',
             zipCode: '34000'
        }
    }

    const result = await paymentProvider.createCheckoutSession({
        user: paymentUser,
        items: [{
            id: plan.slug,
            name: plan.name,
            price: plan.priceTRY || 0,
            currency: 'TRY',
            category: 'Subscription',
            priceId: plan.priceId
        }],
        callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/callback`,
        currency: 'TRY'
    })

    if (result.provider === 'stripe' && result.url) {
        logger.info('Stripe Checkout session created', user.id, { priceId })
        return NextResponse.json({ url: result.url, provider: 'stripe' })
    }

    return new NextResponse('Error creating session', { status: 500 })

  } catch (err: any) {
      logger.error('Checkout Error', user.id, { error: err.message })
      return new NextResponse(err.message, { status: 500 })
  }
}
