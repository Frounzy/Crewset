import { Sidebar } from '@/components/dashboard/sidebar'
import { MobileSidebar } from '@/components/dashboard/mobile-sidebar'
import { UserNav } from '@/components/dashboard/user-nav'
import { ModeToggle } from '@/components/mode-toggle'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, username, avatar_url')
      .eq('id', user.id)
      .single()
    profile = data
  }

  const userNavProps = {
    name: profile?.full_name || user?.user_metadata?.full_name || profile?.username || user?.email?.split('@')[0],
    email: user?.email,
    image: profile?.avatar_url || user?.user_metadata?.avatar_url
  }

  return (
    <div className="h-full relative bg-background text-foreground">
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80]">
        <Sidebar />
      </div>
      <main className="md:pl-72 h-full">
        <div className="flex items-center p-4 border-b border-border gap-4 bg-background/80 backdrop-blur-md sticky top-0 z-50">
            <MobileSidebar />
            <div className="flex w-full justify-end gap-x-4 items-center">
                <ModeToggle />
                <UserNav user={userNavProps} />
            </div>
        </div>
        <div className="p-8 h-full bg-background/50">
            {children}
        </div>
      </main>
    </div>
  )
}
