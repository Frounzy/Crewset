'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { updateProfile, togglePublicStatus, addPortfolioItem, deletePortfolioItem, uploadAvatar, updateFeedbackVisibility } from './actions'
import { Loader2, Plus, Trash, Globe, Copy, Check, ExternalLink, Camera } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Link } from '@/navigation'
import Image from 'next/image'
import { useTranslations, useLocale } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface ProfileClientProps {
  user: any
  profile: any
  portfolio: any[]
  feedbacks?: { 
    id: string; 
    rating: number; 
    comment: string | null; 
    is_public: boolean; 
    created_at: string;
    client?: { name: string; company: string | null }
  }[]
}

export function ProfileClient({ user, profile, portfolio, feedbacks = [] }: ProfileClientProps) {
  const t = useTranslations('Profile')
  const { toast } = useToast()
  const locale = useLocale()
  const [activeTab, setActiveTab] = useState<'general' | 'portfolio' | 'feedback'>('general')
  const [loading, setLoading] = useState(false)
  const [isPublic, setIsPublic] = useState(profile?.is_public || false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '')
  const [uploading, setUploading] = useState(false)

  // Avoid hydration mismatch by only rendering client-specific content after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (profile?.avatar_url) {
      setAvatarUrl(profile.avatar_url)
    }
  }, [profile?.avatar_url])

  // Determine base URL (in production this should be env var)
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const publicUrl = profile?.username ? `${origin}/${locale}/${profile.username}` : ''

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.')
      }

      const file = event.target.files[0]
      const formData = new FormData()
      formData.append('file', file)

      const result = await uploadAvatar(formData)

      if (result.error) {
        throw new Error(result.error)
      }
          
      setAvatarUrl(result.publicUrl!)
      toast({ title: "Success", description: "Avatar uploaded successfully. Don't forget to save." })
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setUploading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast({ description: t('visibility.linkCopied') })
  }

  const handleUpdateProfile = async (formData: FormData) => {
    setLoading(true)
    const result = await updateProfile(formData)
    setLoading(false)

    if (result.error) {
      toast({ title: "Error", description: result.error, variant: "destructive" })
    } else {
      toast({ title: "Success", description: t('errors.updateSuccess') })
    }
  }

  const handleTogglePublic = async (checked: boolean) => {
    try {
      setLoading(true)
      const result = await togglePublicStatus(checked)
      setLoading(false)

      if (result.error) {
        toast({ title: "Error", description: result.error, variant: "destructive" })
      } else {
        setIsPublic(checked)
        toast({ 
          title: checked ? t('visibility.published') : t('visibility.unpublished'), 
          description: checked ? t('visibility.publishedDesc') : t('visibility.unpublishedDesc') 
        })
      }
    } catch (error) {
      setLoading(false)
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" })
    }
  }

  const handleAddPortfolio = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const result = await addPortfolioItem(formData)
    setLoading(false)

    if (result.error) {
      toast({ title: "Error", description: result.error, variant: "destructive" })
    } else {
      toast({ title: "Success", description: t('errors.projectAdded') })
      setAddDialogOpen(false)
      // Reset form? managed by browser reload/revalidation usually
    }
  }

  const handleDeletePortfolio = async (id: string) => {
    if (!confirm(t('portfolio.confirmDelete'))) return
    
    setLoading(true)
    const result = await deletePortfolioItem(id)
    setLoading(false)

    if (result.error) {
      toast({ title: "Error", description: result.error, variant: "destructive" })
    } else {
      toast({ title: "Deleted", description: t('errors.projectDeleted') })
    }
  }

  return (
    <div className="space-y-6">
      {/* Visibility Card */}
      <Card className="bg-gradient-to-br from-card to-primary/5 border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle>{t('visibility.title')}</CardTitle>
            <CardDescription>{t('visibility.description')}</CardDescription>
          </div>
          <Switch 
            checked={isPublic} 
            onCheckedChange={handleTogglePublic}
            disabled={loading || user.plan === 'free'}
          />
        </CardHeader>
        <CardContent>
           {user.plan === 'free' ? (
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  {t.rich('visibility.upgradeToPro', {
                    pro: (chunks) => <span className="font-bold text-primary">{chunks}</span>
                  })}
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 bg-muted p-2 rounded-md font-mono text-sm truncate">
                    {mounted ? (profile?.username ? publicUrl : t('visibility.setUsername')) : '...'}
                  </div>
                  {profile?.username && (
                    <>
                      <Button size="icon" variant="outline" onClick={handleCopy}>
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                      <Link href={`/${locale}/${profile.username}`} target="_blank">
                        <Button size="icon" variant="outline">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex space-x-2 border-b">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'general' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          {t('tabs.general')}
        </button>
        <button
          onClick={() => setActiveTab('portfolio')}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'portfolio' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          {t('tabs.portfolio')} ({portfolio.length})
        </button>
        <button
          onClick={() => setActiveTab('feedback')}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'feedback' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          {t('tabs.feedback')} ({feedbacks.length})
        </button>
      </div>

      {activeTab === 'general' && (
        <Card>
          <CardHeader>
            <CardTitle>{t('tabs.general')}</CardTitle>
            <CardDescription>Update your personal information and social links.</CardDescription>
          </CardHeader>
          <form action={handleUpdateProfile}>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center gap-4 mb-6">
                <div className="relative group">
                  <Avatar className="h-24 w-24 border-2 border-border cursor-pointer">
                    <AvatarImage src={avatarUrl} className="object-cover" />
                    <AvatarFallback className="text-2xl">{profile?.full_name?.slice(0, 2)?.toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                  <label 
                    htmlFor="avatar-upload" 
                    className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full cursor-pointer hover:bg-primary/90 transition-colors shadow-sm"
                  >
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                    <input 
                      id="avatar-upload"
                      type="file" 
                      accept="image/*" 
                      className="hidden"
                      onChange={handleAvatarUpload}
                      disabled={uploading}
                    />
                  </label>
                </div>
                <p className="text-sm text-muted-foreground">Click the camera icon to upload a new photo</p>
                <input type="hidden" name="avatar_url" value={avatarUrl} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">{t('form.fullName')}</Label>
                  <Input id="full_name" name="full_name" defaultValue={profile?.full_name || ''} placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">{t('form.username')}</Label>
                  <Input 
                    id="username" 
                    name="username" 
                    defaultValue={profile?.username || ''} 
                    placeholder="johndoe" 
                    disabled={user.plan === 'free'}
                  />
                  {user.plan === 'free' && <p className="text-xs text-muted-foreground">{t('errors.customUsernamePro')}</p>}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="title">{t('form.title')}</Label>
                  <Input id="title" name="title" defaultValue={profile?.title || ''} placeholder="Senior Product Designer" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="bio">{t('form.bio')}</Label>
                  <Textarea id="bio" name="bio" defaultValue={profile?.bio || ''} placeholder="Tell us about yourself..." className="h-24" />
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-sm font-medium mb-4">{t('form.socialLinks')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input name="social_instagram" placeholder="Instagram URL" defaultValue={profile?.social_links?.instagram || ''} />
                  <Input name="social_twitter" placeholder="X (Twitter) URL" defaultValue={profile?.social_links?.twitter || ''} />
                  <Input name="social_linkedin" placeholder="LinkedIn URL" defaultValue={profile?.social_links?.linkedin || ''} />
                  <Input name="social_website" placeholder="Website URL" defaultValue={profile?.social_links?.website || ''} />
                  <Input name="social_behance" placeholder="Behance URL" defaultValue={profile?.social_links?.behance || ''} />
                  <Input name="social_dribbble" placeholder="Dribbble URL" defaultValue={profile?.social_links?.dribbble || ''} />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('form.save')}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {activeTab === 'portfolio' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">{t('tabs.portfolio')}</h3>
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  {t('portfolio.addProject')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('portfolio.addProject')}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddPortfolio} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="project-title">{t('portfolio.title')}</Label>
                    <Input id="project-title" name="title" required placeholder="Project Name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="project-desc">{t('portfolio.description')}</Label>
                    <Textarea id="project-desc" name="description" placeholder="Short description" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="project-image">{t('portfolio.imageUrl')}</Label>
                    <Input id="project-image" name="image_url" placeholder="https://..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="project-link">{t('portfolio.link')}</Label>
                    <Input id="project-link" name="link" placeholder="https://..." />
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={loading}>{t('portfolio.add')}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {portfolio.map((item) => (
              <Card key={item.id} className="overflow-hidden group">
                <div className="aspect-video w-full bg-muted relative">
                  {item.image_url ? (
                    <Image 
                      src={item.image_url} 
                      alt={item.title} 
                      fill 
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No Image
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h4 className="font-semibold truncate">{item.title}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {item.description}
                  </p>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex justify-between">
                  <Button variant="ghost" size="sm" onClick={() => handleDeletePortfolio(item.id)}>
                    <Trash className="h-4 w-4 text-destructive" />
                  </Button>
                  {item.link && (
                    <Link href={item.link} target="_blank">
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </CardFooter>
              </Card>
            ))}
            {portfolio.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                {t('portfolio.empty')}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'feedback' && (
        <Card>
          <CardHeader>
            <CardTitle>{t('tabs.feedback')}</CardTitle>
            <CardDescription>{t('feedback.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {feedbacks.map((fb) => (
              <div key={fb.id} className="flex items-start justify-between border rounded-md p-3">
                <div className="space-y-1">
                  <div className="text-sm font-medium">⭐ {fb.rating} / 5</div>
                  {fb.comment && <div className="text-sm text-muted-foreground">{fb.comment}</div>}
                  <div className="text-xs text-muted-foreground">{new Date(fb.created_at).toLocaleString()}</div>
                  {fb.client?.name && (
                    <div className="text-xs text-muted-foreground">
                      {fb.client.name}{fb.client.company ? ` • ${fb.client.company}` : ''}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={fb.is_public}
                    onCheckedChange={async (checked) => {
                      const result = await updateFeedbackVisibility(fb.id, checked)
                      if (result.error) {
                        toast({ title: 'Error', description: result.error, variant: 'destructive' })
                      } else {
                        toast({ title: 'Success', description: checked ? t('feedback.madePublic') : t('feedback.madePrivate') })
                      }
                    }}
                    disabled={user.plan === 'free'}
                  />
                </div>
              </div>
            ))}
            {feedbacks.length === 0 && (
              <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                {t('feedback.empty')}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
