
import { Resend } from 'resend'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function sendContractEndedEmail() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error('Error: RESEND_API_KEY is missing in .env.local')
    return
  }

  const resend = new Resend(apiKey)
  const userEmail = 'erolgblk2727@gmail.com'
  
  // Mock Contract Data
  const contract = {
    name: 'Acme Corp Web Design',
    clientName: 'Acme Corp',
    endDate: new Date().toLocaleDateString('tr-TR'),
    value: '5000 USD'
  }

  console.log(`Sending contract ended email to: ${userEmail}...`)

  try {
    const { data, error } = await resend.emails.send({
      from: 'Crewset <onboarding@resend.dev>',
      to: userEmail,
      subject: `Sözleşme Sona Erdi: ${contract.name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Sözleşme Sona Erdi</h2>
          <p>Merhaba,</p>
          <p><strong>${contract.clientName}</strong> ile olan <strong>${contract.name}</strong> sözleşmenizin süresi bugün itibarıyla dolmuştur.</p>
          
          <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Bitiş Tarihi:</strong> ${contract.endDate}</p>
            <p><strong>Değer:</strong> ${contract.value}</p>
          </div>

          <p>Yenileme yapmak veya durumu güncellemek için panele giriş yapabilirsiniz.</p>
          
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/contracts" style="display: inline-block; background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">Sözleşmeyi Görüntüle</a>
        </div>
      `
    })

    if (error) {
      console.error('Resend Error:', error)
    } else {
      console.log('Email sent successfully!', data)
    }
  } catch (err) {
    console.error('Failed to send email:', err)
  }
}

sendContractEndedEmail()
