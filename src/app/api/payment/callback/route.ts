import { NextResponse } from 'next/server'
import { logger } from '@/lib/security/logger'

export async function POST(req: Request) {
  try {
    // Iyzico devre dışı. Bu endpoint artık kullanılmıyor.
    // Güvenli bir şekilde faturalandırma sayfasına yönlendiriyoruz.
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`)

  } catch (error: any) {
    logger.error('Callback Error', undefined, { error: error.message })
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?error=server_error`)
  }
}
