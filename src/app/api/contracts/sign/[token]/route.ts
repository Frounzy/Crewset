import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/security/logger'

export async function GET(req: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    logger.critical('Missing SUPABASE_SERVICE_ROLE_KEY for Sign API')
    return NextResponse.json({ error: 'Server configuration missing' }, { status: 500 })
  }
  const supabase = createAdminClient()
  const ip = (req.headers.get('x-forwarded-for') ?? '127.0.0.1').split(',')[0]
  const userAgent = req.headers.get('user-agent') ?? ''

  const { data: link, error } = await supabase
    .from('contract_sign_links')
    .select('id, user_id, contract_id, token, expires_at, used_at, signer_name, signer_email')
    .eq('token', token)
    .single()

  if (error || !link) {
    logger.warn('Sign link not found', undefined, { token, error: error?.message })
    return NextResponse.json({ error: 'Link bulunamadı' }, { status: 404 })
  }

  if (link.used_at) {
    return NextResponse.json({ error: 'Link kullanılmış' }, { status: 410 })
  }

  if (new Date(link.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ error: 'Link süresi dolmuş' }, { status: 410 })
  }

  await supabase.from('contract_audit_logs').insert({
    user_id: link.user_id,
    contract_id: link.contract_id,
    sign_link_id: link.id,
    action: 'viewed',
    ip_address: ip,
    user_agent: userAgent,
  })

  // Fetch seller contract template
  const { data: profile } = await supabase
    .from('profiles')
    .select('contract_template')
    .eq('id', link.user_id)
    .single()

  return NextResponse.json({
    contract_id: link.contract_id,
    signer_name: link.signer_name,
    signer_email: link.signer_email,
    expires_at: link.expires_at,
    contract_template: profile?.contract_template || null,
  })
}

export async function POST(req: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Server configuration missing' }, { status: 500 })
  }
  const supabase = createAdminClient()
  const ip = (req.headers.get('x-forwarded-for') ?? '127.0.0.1').split(',')[0]
  const userAgent = req.headers.get('user-agent') ?? ''

  const { data: link } = await supabase
    .from('contract_sign_links')
    .select('id, user_id, contract_id, expires_at, used_at')
    .eq('token', token)
    .single()

  if (!link) {
    return NextResponse.json({ error: 'Link bulunamadı' }, { status: 404 })
  }
  if (link.used_at) {
    return NextResponse.json({ error: 'Link kullanılmış' }, { status: 410 })
  }
  if (new Date(link.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ error: 'Link süresi dolmuş' }, { status: 410 })
  }

  const now = new Date().toISOString()

  const { error: updateError } = await supabase
    .from('contract_sign_links')
    .update({ used_at: now, ip_address: ip, user_agent: userAgent })
    .eq('id', link.id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  await supabase.from('contract_audit_logs').insert({
    user_id: link.user_id,
    contract_id: link.contract_id,
    sign_link_id: link.id,
    action: 'signed',
    ip_address: ip,
    user_agent: userAgent,
  })

  return NextResponse.json({ success: true })
}
