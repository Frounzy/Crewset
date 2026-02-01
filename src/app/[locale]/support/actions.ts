'use server'

import { Resend } from 'resend'
import { z } from 'zod'
import { getTranslations } from 'next-intl/server'

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  subject: z.string().min(1),
  message: z.string().min(5),
})

export async function sendSupportEmail(prevState: any, formData: FormData) {
  const t = await getTranslations('Support.form')
  
  const rawData = {
    name: formData.get('name'),
    email: formData.get('email'),
    subject: formData.get('subject'),
    message: formData.get('message'),
  }

  const validatedFields = schema.safeParse(rawData)

  if (!validatedFields.success) {
    console.error('Support form validation failed:', validatedFields.error.flatten())
    return { error: t('errors.validation') }
  }

  const { name, email, subject, message } = validatedFields.data

  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    
    // Send to support team
    await resend.emails.send({
      from: 'Crewset Support <onboarding@resend.dev>',
      to: process.env.SUPPORT_EMAIL || 'support@crewset.com',
      replyTo: email,
      subject: `[Support] ${subject}`,
      html: `
        <h3>New Support Request</h3>
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #ccc;">
          ${message.replace(/\n/g, '<br>')}
        </div>
      `
    })

    // Send auto-reply to user
    await resend.emails.send({
      from: 'Crewset Support <onboarding@resend.dev>',
      to: email,
      subject: `Re: ${subject} - Ticket Received`,
      html: `
        <p>Hi ${name},</p>
        <p>We received your support request. Our team will get back to you as soon as possible.</p>
        <hr>
        <p><strong>Your Message:</strong></p>
        <p>${message}</p>
      `
    })

    return { success: t('success') }

  } catch (error) {
    console.error('Support email error:', error)
    return { error: t('errors.send') }
  }
}
