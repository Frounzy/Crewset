'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { useTranslations } from 'next-intl'
import { Loader2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { sendSupportEmail } from './actions'
import { useEffect, useRef } from 'react'
import { useToast } from '@/hooks/use-toast'

function SubmitButton() {
  const { pending } = useFormStatus()
  const t = useTranslations('Support.form')
  
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {t('sending')}
        </>
      ) : (
        <>
          <Send className="mr-2 h-4 w-4" />
          {t('submit')}
        </>
      )}
    </Button>
  )
}

export function ContactForm() {
  const t = useTranslations('Support')
  const { toast } = useToast()
  const [state, formAction] = useActionState(sendSupportEmail, null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state?.success) {
      toast({
        title: t('form.successTitle'),
        description: state.success,
      })
      formRef.current?.reset()
    } else if (state?.error) {
      toast({
        title: t('form.errorTitle'),
        description: state.error,
        variant: 'destructive',
      })
    }
  }, [state, toast, t])

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('form.title')}</CardTitle>
        <CardDescription>{t('form.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={formAction} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('form.name')}</Label>
              <Input id="name" name="name" placeholder={t('form.namePlaceholder')} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('form.email')}</Label>
              <Input id="email" name="email" type="email" placeholder={t('form.emailPlaceholder')} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">{t('form.subject')}</Label>
            <Input id="subject" name="subject" placeholder={t('form.subjectPlaceholder')} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">{t('form.message')}</Label>
            <Textarea 
              id="message" 
              name="message" 
              placeholder={t('form.messagePlaceholder')} 
              required 
              minLength={5}
              className="min-h-[120px]"
            />
          </div>
          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  )
}
