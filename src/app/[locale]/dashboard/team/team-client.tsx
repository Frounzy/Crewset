'use client'

import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { createOrganization, inviteMember, leaveOrganization, removeMember } from './actions'
import { useToast } from '@/hooks/use-toast'
import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface TeamClientProps {
  organization: {
    id: string
    name: string
    role: string // 'owner' | 'member'
  } | null
  members: {
    id: string
    role: string
    profile: {
      email: string
      full_name: string | null
    }
    user_id: string
  }[]
  currentUserId: string
  subscriptionPlan: string
}

const createOrgSchema = z.object({
  name: z.string().min(2).max(50),
})

const inviteMemberSchema = z.object({
  email: z.string().email(),
})

export function TeamClient({ organization, members, currentUserId, subscriptionPlan }: TeamClientProps) {
  const t = useTranslations('Team')
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const createForm = useForm<z.infer<typeof createOrgSchema>>({
    resolver: zodResolver(createOrgSchema),
    defaultValues: {
      name: '',
    },
  })

  const inviteForm = useForm<z.infer<typeof inviteMemberSchema>>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: '',
    },
  })

  async function onCreateOrg(data: z.infer<typeof createOrgSchema>) {
    setLoading(true)
    const formData = new FormData()
    formData.append('name', data.name)
    const result = await createOrganization(formData)
    setLoading(false)

    if (result?.error) {
      toast({
        title: t('errorTitle') || "Error",
        description: result.error,
        variant: "destructive"
      })
    } else {
      toast({
        title: "Organization created",
        description: "You have successfully created an organization.",
      })
      createForm.reset()
      router.refresh()
    }
  }

  async function onInviteMember(data: z.infer<typeof inviteMemberSchema>) {
    setLoading(true)
    const formData = new FormData()
    formData.append('email', data.email)
    const result = await inviteMember(formData)
    setLoading(false)

    if (result?.error) {
      toast({
        title: t('errorTitle') || "Error",
        description: result.error,
        variant: "destructive"
      })
    } else {
      toast({
        title: "Member invited",
        description: "The user has been added to the organization.",
      })
      inviteForm.reset()
      router.refresh()
    }
  }

  async function onLeaveOrg() {
    if (!confirm("Are you sure you want to leave this organization?")) return
    
    setLoading(true)
    const result = await leaveOrganization()
    setLoading(false)

    if (result?.error) {
      toast({
        title: t('errorTitle') || "Error",
        description: result.error,
        variant: "destructive"
      })
    } else {
      toast({
        title: "Left organization",
        description: "You have successfully left the organization.",
      })
      router.refresh()
    }
  }

  async function onRemoveMember(memberId: string) {
    if (!confirm("Are you sure you want to remove this member?")) return
    
    setLoading(true)
    const formData = new FormData()
    formData.append('memberId', memberId)
    const result = await removeMember(formData)
    setLoading(false)

    if (result?.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive"
      })
    } else {
      toast({
        title: "Member removed",
        description: "The member has been removed from the organization.",
      })
      router.refresh()
    }
  }

  if (!organization) {
    return (
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('createOrg')}</CardTitle>
            <CardDescription>{t('createOrgDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            {subscriptionPlan !== 'agency' ? (
              <div className="bg-muted/50 p-6 rounded-lg text-center border border-dashed">
                <p className="text-muted-foreground mb-2">Team creation is only available on the Agency plan.</p>
                <Button variant="outline" asChild>
                    <a href="/dashboard/billing">Upgrade to Agency</a>
                </Button>
              </div>
            ) : (
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(onCreateOrg)} className="space-y-4">
                <FormField
                  control={createForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('orgName')}</FormLabel>
                      <FormControl>
                        <Input placeholder="Acme Corp" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : t('create')}
                </Button>
              </form>
            </Form>
            )}
          </CardContent>
        </Card>
        
        <div className="text-center text-muted-foreground p-8 border rounded-lg border-dashed">
          {t('noOrg')}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Organization Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('currentOrg')}</CardTitle>
              <CardDescription>{organization.name}</CardDescription>
            </div>
            <Button variant="outline" onClick={onLeaveOrg} disabled={loading}>
              {t('leaveOrg')}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Invite Member (Owner only) */}
      {organization.role === 'owner' && (
        <Card>
          <CardHeader>
            <CardTitle>{t('inviteMember')}</CardTitle>
            <CardDescription>{t('inviteDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            {subscriptionPlan !== 'agency' ? (
              <div className="bg-muted/50 p-4 rounded-lg text-center border border-dashed">
                  <p className="text-muted-foreground mb-2">Inviting members is only available on the Agency plan.</p>
                   <Button variant="outline" asChild size="sm">
                       <a href="/dashboard/billing">Upgrade to Agency</a>
                   </Button>
              </div>
            ) : (
            <Form {...inviteForm}>
              <form onSubmit={inviteForm.handleSubmit(onInviteMember)} className="flex items-end gap-4">
                <FormField
                  control={inviteForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>{t('email')}</FormLabel>
                      <FormControl>
                        <Input placeholder="colleague@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={loading}>
                  {loading ? "Adding..." : t('add')}
                </Button>
              </form>
            </Form>
            )}
          </CardContent>
        </Card>
      )}

      {/* Members List */}
      <Card>
        <CardHeader>
          <CardTitle>{t('members')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('email')}</TableHead>
                <TableHead>{t('role')}</TableHead>
                {organization.role === 'owner' && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{member.profile?.full_name || 'User'}</span>
                      <span className="text-xs text-muted-foreground">{member.profile?.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={member.role === 'owner' ? 'default' : 'secondary'}>
                      {member.role === 'owner' ? t('owner') : t('member')}
                    </Badge>
                  </TableCell>
                  {organization.role === 'owner' && (
                    <TableCell className="text-right">
                      {member.user_id !== currentUserId && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => member.user_id && onRemoveMember(member.user_id)}
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
