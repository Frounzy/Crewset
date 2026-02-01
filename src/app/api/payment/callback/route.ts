import { NextResponse } from 'next/server'
import { getPaymentProvider } from '@/lib/payment/service'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/security/logger'
import { Resend } from 'resend'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const token = formData.get('token') as string
    
    if (!token) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?error=missing_token`)
    }

    const provider = getPaymentProvider()
    const verification = await provider.verifyPayment(token)

    if (!verification.success) {
        logger.error('Payment verification failed', undefined, { token, raw: verification.raw })
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?error=verification_failed`)
    }

    // Payment successful, update subscription
    // We need to extract user_id and plan from the transaction details
    // In our Iyzico implementation:
    // conversationId format: sess_{timestamp}_{userId}
    // basketItems[0].id: planSlug

    const raw = verification.raw
    const conversationId = raw.conversationId
    
    // Extract userId assuming format sess_{timestamp}_{userId}
    // UUIDs don't contain underscores, so we can split by underscore
    const parts = conversationId.split('_')
    const extractedUserId = parts.length >= 3 ? parts.slice(2).join('_') : null

    if (!extractedUserId) {
         logger.error('Could not extract user_id from conversationId', undefined, { conversationId })
         return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?error=invalid_user`)
    }

    const basketItems = raw.basketItems
    const planSlug = basketItems && basketItems.length > 0 ? basketItems[0].id : null

    if (!planSlug) {
        logger.error('Could not extract plan slug from basketItems', extractedUserId, { raw })
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?error=invalid_plan`)
    }

    const supabase = createAdminClient()
    
    // Calculate period end (30 days from now)
    const currentPeriodEnd = new Date()
    currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 30)

    await supabase
        .from('subscriptions')
        .upsert({
            user_id: extractedUserId,
            stripe_subscription_id: `iyz_${verification.paymentId}`, // Use Iyzico payment ID as fake sub ID
            stripe_customer_id: `iyz_cust_${extractedUserId}`,
            plan: planSlug,
            status: 'active',
            current_period_end: currentPeriodEnd.toISOString(),
        })

    // Send Invoice/Receipt Email
    try {
      const resend = new Resend(process.env.RESEND_API_KEY)
      // Fetch user email
      const { data: userData } = await supabase.auth.admin.getUserById(extractedUserId)
      const userEmail = userData.user?.email

      if (userEmail) {
        await resend.emails.send({
          from: 'Crewset Billing <onboarding@resend.dev>',
          to: userEmail,
          subject: 'Payment Successful - Receipt',
          html: `
            <h1>Payment Received</h1>
            <p>Thank you for your payment. Your subscription is now active.</p>
            <p><strong>Plan:</strong> ${planSlug}</p>
            <p><strong>Amount:</strong> ${raw.paidPrice} ${raw.currency}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            <hr>
            <h3>Invoice Request</h3>
            <p>If you need an official invoice for this transaction, please reply to this email or contact us at <a href="mailto:${process.env.SUPPORT_EMAIL || 'support@crewset.com'}">${process.env.SUPPORT_EMAIL || 'support@crewset.com'}</a> with your billing details.</p>
            <p>We are happy to provide a manual invoice upon request.</p>
          `
        })
      }
    } catch (emailError) {
      logger.error('Failed to send receipt email', extractedUserId, { error: emailError })
      // Don't block the success redirect
    }

    logger.info('Subscription activated via Iyzico', extractedUserId, { plan: planSlug, paymentId: verification.paymentId })

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=true`)

  } catch (error: any) {
    logger.error('Callback Error', undefined, { error: error.message })
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?error=server_error`)
  }
}
