
import { Resend } from 'resend'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function sendTestInvoice() {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const userEmail = 'gobelekerol2@gmail.com'
  const planSlug = 'agency'
  const priceTRY = 1200
  const currency = 'TRY'
  const supportEmail = process.env.SUPPORT_EMAIL || 'support@crewset.com'

  console.log('Sending email to:', userEmail)
  console.log('Using Resend Key:', process.env.RESEND_API_KEY ? 'Present' : 'Missing')

  try {
    const data = await resend.emails.send({
      from: 'Crewset Billing <onboarding@resend.dev>',
      to: userEmail,
      subject: 'Payment Successful - Receipt (Test)',
      html: `
        <h1>Payment Received</h1>
        <p>Thank you for your payment. Your subscription is now active.</p>
        <p><strong>Plan:</strong> ${planSlug}</p>
        <p><strong>Amount:</strong> ${priceTRY} ${currency}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        <hr>
        <h3>Invoice Request</h3>
        <p>If you need an official invoice for this transaction, please reply to this email or contact us at <a href="mailto:${supportEmail}">${supportEmail}</a> with your billing details.</p>
        <p>We are happy to provide a manual invoice upon request.</p>
      `
    })

    console.log('Email sent successfully:', data)
  } catch (error) {
    console.error('Failed to send email:', error)
  }
}

sendTestInvoice()
