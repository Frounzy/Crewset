import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(req: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Email service unavailable' }, { status: 500 })
    }
    const target = process.env.EARLY_ACCESS_TARGET_EMAIL || process.env.ADMIN_EMAIL || process.env.SUPPORT_EMAIL
    if (!target) {
      return NextResponse.json({ error: 'Target email not configured' }, { status: 500 })
    }

    const body = await req.json().catch(() => ({}))
    const name = String(body?.name || '').trim()
    const email = String(body?.email || '').trim()
    const company = String(body?.company || '').trim()
    const purpose = String(body?.purpose || '').trim()

    if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Geçersiz alanlar' }, { status: 400 })
    }

    const resend = new Resend(apiKey)
    const html = `
      <div style="font-family: sans-serif; max-width: 640px; margin: 0 auto;">
        <h2>Yeni Erken Erişim Başvurusu</h2>
        <p><strong>Ad Soyad:</strong> ${name}</p>
        <p><strong>E-posta:</strong> ${email}</p>
        ${company ? `<p><strong>Firma/Proje:</strong> ${company}</p>` : ''}
        ${purpose ? `<div style="margin-top: 12px;"><strong>Planlanan Kullanım:</strong><div style="background:#f9f9f9; padding:12px; border-radius:8px; white-space:pre-wrap;">${purpose}</div></div>` : ''}
        <hr style="margin:20px 0;">
        <p style="color:#6b7280; font-size: 12px;">Bu başvuru Crewset landing üzerinden iletilmiştir.</p>
      </div>
    `

    const { error } = await resend.emails.send({
      from: 'Crewset <onboarding@resend.dev>',
      to: target,
      replyTo: email,
      subject: 'Erken Erişim Başvurusu',
      html,
    })
    if (error) {
      return NextResponse.json({ error: error.message || 'Email send failed' }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
