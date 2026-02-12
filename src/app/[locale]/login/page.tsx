'use client'

import { Link } from '@/navigation'
import { useTransition, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { login, signInWithOAuth, signInWithMagicLink } from '@/app/auth/actions'
import { Icons } from '@/components/icons'
import { useToast } from '@/hooks/use-toast'
import { Separator } from '@/components/ui/separator'

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(1, {
    message: "Password is required.",
  }),
})

export default function LoginPage() {
  const t = useTranslations('Auth.login')
  const [isPending, startTransition] = useTransition()
  const [isMagicLinkPending, startMagicLinkTransition] = useTransition()
  const [isGooglePending, startGoogleTransition] = useTransition()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const formData = new FormData()
      formData.append('email', values.email)
      formData.append('password', values.password)
      
      const result = await login(formData)
      if (result?.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        })
      }
    })
  }

  function onMagicLink() {
    const email = form.getValues('email')
    const result = formSchema.shape.email.safeParse(email)
    
    if (!result.success) {
      form.setError('email', { message: t('emailLabel') })
      return
    }

    startMagicLinkTransition(async () => {
      const formData = new FormData()
      formData.append('email', email)
      
      const result = await signInWithMagicLink(formData)
      if (result?.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        })
      } else if (result?.success) {
        toast({
          title: "Success",
          description: t('magicLinkSent'),
        })
      }
    })
  }

  function onGoogleSignIn() {
    startGoogleTransition(async () => {
      await signInWithOAuth('google')
    })
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">{t('title')}</CardTitle>
          <CardDescription>
            {t('description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('emailLabel')}</FormLabel>
                    <FormControl>
                      <Input placeholder="m@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('passwordLabel')}</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isPending || isMagicLinkPending || isGooglePending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('submitting')}
                  </>
                ) : (
                  t('submit')
                )}
              </Button>
            </form>
          </Form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                {t('orContinueWith')}
              </span>
            </div>
          </div>

          <div className="grid gap-2">
            <Button
              variant="outline"
              type="button"
              disabled={isPending || isMagicLinkPending || isGooglePending}
              onClick={onMagicLink}
            >
              {isMagicLinkPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Icons.mail className="mr-2 h-4 w-4" />
              )}
              {t('magicLink')}
            </Button>
            <Button
              variant="outline"
              type="button"
              disabled={isPending || isMagicLinkPending || isGooglePending}
              onClick={onGoogleSignIn}
            >
              {isGooglePending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Icons.google className="mr-2 h-4 w-4" />
              )}
              {t('google')}
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <div className="text-sm text-muted-foreground text-center">
            {t('noAccount')}{" "}
            <Link href="/register" className="text-primary hover:underline">
              {t('signUp')}
            </Link>
          </div>
          <div className="text-sm text-muted-foreground text-center">
             <Link href="/forgot-password" className="text-primary hover:underline">
              {t('forgotPassword')}
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
