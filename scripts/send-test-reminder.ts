
import { Resend } from 'resend'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function sendTestReminder() {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const userEmail = 'gobelekerol2@gmail.com'
  const contractName = 'Test Sözleşmesi - Acme Corp'
  const clientName = 'Acme Corp'
  const daysUntilExpiration = 7
  const endDate = new Date()
  endDate.setDate(endDate.getDate() + daysUntilExpiration)
  const formattedEndDate = endDate.toLocaleDateString('tr-TR')
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  console.log('Sending reminder email to:', userEmail)
  console.log('Using Resend Key:', process.env.RESEND_API_KEY ? 'Present' : 'Missing')

  try {
    const data = await resend.emails.send({
      from: 'Crewset <onboarding@resend.dev>',
      to: userEmail,
      subject: `Sözleşme Yakında Bitiyor: ${contractName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Sözleşme Yakında Bitiyor</h2>
          <p><strong>${clientName}</strong> ile olan <strong>${contractName}</strong> sözleşmenizin süresi <strong>${daysUntilExpiration} gün</strong> içinde dolacak.</p>
          <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Bitiş Tarihi:</strong> ${formattedEndDate}</p>
            <p><strong>Değer:</strong> 15.000 TL</p>
          </div>
          <p>Yenileme görüşmelerine başlamak için harika bir zaman!</p>
          <a href="${appUrl}/dashboard/contracts" style="display: inline-block; background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Sözleşmeyi Görüntüle</a>
        </div>
      `
    })

    console.log('Reminder email sent successfully:', data)
  } catch (error) {
    console.error('Failed to send email:', error)
  }
}

sendTestReminder()
