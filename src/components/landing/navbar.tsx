'use client'

import { Link } from '@/navigation'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useTranslations } from 'next-intl'
import dynamic from 'next/dynamic'

const ModeToggle = dynamic(() => import('@/components/mode-toggle').then(mod => mod.ModeToggle), {
  ssr: false,
  loading: () => <Button variant="outline" size="icon" className="opacity-0" aria-hidden="true" />
})

const LanguageSwitcher = dynamic(() => import('@/components/language-switcher').then(mod => mod.LanguageSwitcher), {
  ssr: false,
  loading: () => <Button variant="ghost" size="icon" className="opacity-0" aria-hidden="true" />
})

interface NavbarProps {
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
  } | null
}

export function Navbar({ user }: NavbarProps) {
  const t = useTranslations('Navbar')
  const initials = user?.name?.slice(0, 2).toUpperCase() || 'U'

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="flex h-16 items-center px-4 max-w-7xl mx-auto justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-xl">
            Crewset
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link href="#features" className="hover:text-foreground transition-colors">
              {t('features')}
            </Link>
            <Link href="#pricing" className="hover:text-foreground transition-colors">
              {t('pricing')}
            </Link>
            <Link href="#faq" className="hover:text-foreground transition-colors">
              {t('faq')}
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <ModeToggle />
          
          {user ? (
            <Link href="/dashboard">
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10 border">
                  <AvatarImage src={user.image || ''} alt={user.name || 'User'} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">{t('login')}</Button>
              </Link>
              <Link href="/register">
                <Button>{t('getStarted')}</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
