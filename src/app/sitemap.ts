import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://crewset.app'
  const pages = [
    '/',
    '/en',
    '/tr',
    '/en/login',
    '/tr/login',
    '/en/register',
    '/tr/register',
    '/en/privacy',
    '/tr/privacy',
    '/en/terms',
    '/tr/terms',
    '/en/refund',
    '/tr/refund',
    '/en/support',
    '/tr/support',
  ]
  const now = new Date()
  return pages.map((p) => ({
    url: `${baseUrl}${p}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: p === '/' || p === '/en' || p === '/tr' ? 1 : 0.7,
  }))
}
