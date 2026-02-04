import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export default async function FeedbackRedirectPage({ params }: { params: { token: string } }) {
  const cookieStore = await cookies()
  const rawLocale = cookieStore.get('NEXT_LOCALE')?.value || 'tr'
  const locale = rawLocale === 'en' || rawLocale === 'tr' ? rawLocale : 'tr'
  const token = params.token
  redirect(`/${locale}/feedback/${token}`)
}
