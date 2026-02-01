import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Github, 
  Twitter, 
  Linkedin, 
  Instagram, 
  Globe, 
  Mail, 
  Dribbble,
  Briefcase
} from 'lucide-react'

export const metadata = {
  title: 'Profile | Crewset',
}

interface Props {
  params: Promise<{
    username: string
    locale: string
  }>
}

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params
  const supabase = await createClient()

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (!profile || !profile.is_public) {
    return notFound()
  }

  // Fetch portfolio items
  const { data: portfolio } = await supabase
    .from('portfolio_items')
    .select('*')
    .eq('user_id', profile.id)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  const socialLinks = (profile.social_links as Record<string, string>) || {}

  const SocialIcon = ({ type, url }: { type: string, url: string }) => {
    if (!url) return null
    
    let Icon = Globe
    if (type === 'github') Icon = Github
    if (type === 'twitter') Icon = Twitter
    if (type === 'linkedin') Icon = Linkedin
    if (type === 'instagram') Icon = Instagram
    if (type === 'dribbble') Icon = Dribbble
    if (type === 'behance') Icon = Briefcase // Placeholder for Behance

    return (
      <Link href={url} target="_blank" rel="noopener noreferrer">
        <Button variant="ghost" size="icon" className="hover:scale-110 transition-transform text-muted-foreground hover:text-primary">
          <Icon className="h-5 w-5" />
        </Button>
      </Link>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="w-full bg-card/30 border-b border-border backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 py-12 md:py-20 flex flex-col items-center text-center space-y-6">
          <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-background shadow-2xl ring-2 ring-primary/20">
            <Image 
              src={profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.full_name || username}&background=random`} 
              alt={profile.full_name || username}
              fill
              className="object-cover"
            />
          </div>
          
          <div className="space-y-2 max-w-lg">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              {profile.full_name || username}
            </h1>
            {profile.title && (
              <p className="text-lg md:text-xl text-primary font-medium">
                {profile.title}
              </p>
            )}
            {profile.bio && (
              <p className="text-muted-foreground leading-relaxed">
                {profile.bio}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {Object.entries(socialLinks).map(([key, value]) => (
               <SocialIcon key={key} type={key} url={value as string} />
            ))}
          </div>

          <div className="flex gap-4 pt-4">
             {profile.email && (
                <Link href={`mailto:${profile.email}`}>
                    <Button className="rounded-full px-8 shadow-[0_0_20px_-5px_hsl(var(--primary)/0.5)]">
                        <Mail className="mr-2 h-4 w-4" /> Contact Me
                    </Button>
                </Link>
             )}
          </div>
        </div>
      </div>

      {/* Portfolio Grid */}
      <div className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-semibold mb-8 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            Selected Work
        </h2>
        
        {!portfolio || portfolio.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground bg-card/20 rounded-xl border border-dashed">
                <p>No portfolio items yet.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolio.map((item) => (
                <Card key={item.id} className="group overflow-hidden border-border/50 bg-card/40 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                {item.image_url && (
                    <div className="relative h-48 w-full overflow-hidden">
                    <Image 
                        src={item.image_url} 
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    </div>
                )}
                <CardContent className="p-5">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                        {item.title}
                    </h3>
                    {item.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                            {item.description}
                        </p>
                    )}
                    {item.link && (
                        <Link href={item.link} target="_blank" className="inline-flex items-center text-xs font-medium text-primary hover:underline">
                            View Project →
                        </Link>
                    )}
                </CardContent>
                </Card>
            ))}
            </div>
        )}
      </div>
      
      {/* Simple Footer */}
      <footer className="py-8 text-center text-sm text-muted-foreground border-t border-border/40 mt-12">
        <p>© {new Date().getFullYear()} {profile.full_name}. Powered by <Link href="/" className="font-semibold hover:text-primary">Crewset</Link></p>
      </footer>
    </div>
  )
}
