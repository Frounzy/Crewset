import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(req: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params
  const supabase = createAdminClient()

  const { data: requestData, error } = await supabase
    .from('client_feedback_requests')
    .select('id, expires_at, used_at')
    .eq('token', token)
    .single()

  if (error || !requestData) {
    return NextResponse.json({ error: 'Link geçersiz' }, { status: 400 })
  }

  if (requestData.used_at) {
    return NextResponse.json({ error: 'Bu link daha önce kullanılmış' }, { status: 400 })
  }

  if (new Date(requestData.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ error: 'Linkin süresi dolmuş' }, { status: 400 })
  }

  return NextResponse.json({ expires_at: requestData.expires_at })
}

export async function POST(req: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params
  const supabase = createAdminClient()

  const body = await req.json().catch(() => ({}))
  const rating = Number(body?.rating ?? 0)
  const comment = typeof body?.comment === 'string' ? body.comment : ''

  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Geçersiz puan' }, { status: 400 })
  }

  const { data: requestData, error } = await supabase
    .from('client_feedback_requests')
    .select('id, user_id, client_id, expires_at, used_at')
    .eq('token', token)
    .single()

  if (error || !requestData) {
    return NextResponse.json({ error: 'Link geçersiz' }, { status: 400 })
  }

  if (requestData.used_at) {
    return NextResponse.json({ error: 'Bu link daha önce kullanılmış' }, { status: 400 })
  }

  if (new Date(requestData.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ error: 'Linkin süresi dolmuş' }, { status: 400 })
  }

  const now = new Date().toISOString()

  const { error: updateErr } = await supabase
    .from('client_feedback_requests')
    .update({ used_at: now })
    .eq('id', requestData.id)

  if (updateErr) {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }

  const { error: insertErr } = await supabase
    .from('client_feedbacks')
    .insert({
      user_id: requestData.user_id,
      client_id: requestData.client_id,
      request_id: requestData.id,
      rating,
      comment,
      published: false,
    })

  if (insertErr) {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
