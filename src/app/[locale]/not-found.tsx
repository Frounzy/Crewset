import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from '@/navigation'
import { useTranslations } from 'next-intl'
import React from 'react'

const messages = [
  "Burada hiçbir şey yok… ama merak güzel şey 😄",
  "Yanlış kapı 🚪 Ama denemeye devam!",
  "Hack sandın ama 404 😏",
]

export default function NotFound() {
  const t = useTranslations('Common')
  const msg = messages[Math.floor(Math.random() * messages.length)]
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-8">
      <Card className="max-w-lg w-full">
        <CardContent className="p-8 text-center space-y-6">
          <div className="text-6xl animate-bounce">🪄</div>
          <h1 className="text-2xl font-bold">404</h1>
          <p className="text-muted-foreground">{msg}</p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/">
              <Button>Anasayfaya dön</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline">Dashboard</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
