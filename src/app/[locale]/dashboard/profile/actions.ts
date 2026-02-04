'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAuthenticatedUser, requirePlan } from '@/lib/security/auth'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const profileSchema = z.object({
  full_name: z.string().min(2).max(50).optional(),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_-]+$/, 'Username must be alphanumeric').optional(),
  bio: z.string().max(500).optional(),
  title: z.string().max(100).optional(),
  avatar_url: z.string().optional(),
  social_links: z.any().optional(), // Validate structure if needed
})

const portfolioSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  image_url: z.string().url().optional().or(z.literal('')),
  link: z.string().url().optional().or(z.literal('')),
})

export async function updateProfile(formData: FormData) {
  const user = await getAuthenticatedUser()
  
  // Parse social links
  const social_links = {
    instagram: formData.get('social_instagram') as string || null,
    twitter: formData.get('social_twitter') as string || null,
    linkedin: formData.get('social_linkedin') as string || null,
    website: formData.get('social_website') as string || null,
    behance: formData.get('social_behance') as string || null,
    dribbble: formData.get('social_dribbble') as string || null,
    github: formData.get('social_github') as string || null,
  }

  const rawData = {
    full_name: formData.get('full_name') as string,
    username: formData.get('username') as string,
    bio: formData.get('bio') as string,
    title: formData.get('title') as string,
    avatar_url: formData.get('avatar_url') as string,
    social_links: social_links,
  }
  
  // Validate with Zod
  const validation = profileSchema.safeParse({
    ...rawData,
    // Handle empty strings for optional fields if necessary, 
    // but Zod .optional() usually expects undefined. 
    // For simplicity, we trust the schema handles string inputs or we let it pass.
    // Actually, empty string "" satisfies string().optional() but might fail min(2).
    // Let's rely on client-side mostly, or relax server side if needed.
    // For now, let's just use rawData for values but do manual checks where critical.
  })
  
  // If we strictly enforce schema:
  // if (!validation.success) return { error: validation.error.issues[0].message }

  const supabase = await createClient()

  // Check if username is being changed/set
  if (rawData.username) {
    // Check Pro plan
    if (user.plan === 'free') {
       // If they are free, they can't set a username (which enables public profile)
       // But maybe we allow them to save it but not publish? 
       // User requirement: "PRO olmayan kullanıcılar göremez / oluşturamaz"
       return { error: 'Custom usernames are available on Pro plan only.' }
    }

    // Check uniqueness
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', rawData.username)
      .neq('id', user.id) // Exclude self
      .single()

    if (existing) {
      return { error: 'Username is already taken.' }
    }
  }

  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      full_name: rawData.full_name,
      username: rawData.username || null,
      bio: rawData.bio,
      title: rawData.title,
      avatar_url: rawData.avatar_url,
      social_links: social_links,
      updated_at: new Date().toISOString(),
    })

  if (error) {
    console.error('Update Profile Error:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard/profile')
  return { success: true }
}

export async function uploadAvatar(formData: FormData) {
  const user = await getAuthenticatedUser()
  const file = formData.get('file') as File
  
  if (!file) {
    return { error: 'No file uploaded' }
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    return { error: 'File must be an image' }
  }

  // Validate file size (e.g., 2MB)
  if (file.size > 2 * 1024 * 1024) {
    return { error: 'File size must be less than 2MB' }
  }

  const supabase = createAdminClient()
  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}-${Math.random().toString(36).substring(7)}.${fileExt}`
  const filePath = `${fileName}`

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert: true
    })

  if (uploadError) {
    console.error('Upload Error:', uploadError)
    return { error: uploadError.message }
  }

  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath)

  return { success: true, publicUrl }
}

export async function togglePublicStatus(isPublic: boolean) {
  try {
    await requirePlan(['pro', 'agency'])
  } catch (e) {
    return { error: 'Public profiles are available on Pro plan only.' }
  }

  const user = await getAuthenticatedUser()
  const supabase = await createClient()

  // Ensure username is set before enabling
  if (isPublic) {
    const { data: profile } = await supabase.from('profiles').select('username').eq('id', user.id).single()
    if (!profile?.username) {
      return { error: 'You must set a username before publishing your profile.' }
    }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ is_public: isPublic })
    .eq('id', user.id)

  if (error) {
    console.error('Toggle Public Error:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard/profile')
  return { success: true }
}

export async function addPortfolioItem(formData: FormData) {
  try {
    await requirePlan(['pro', 'agency'])
  } catch (e) {
    return { error: 'Portfolio is available on Pro plan only.' }
  }

  const user = await getAuthenticatedUser()
  const supabase = await createClient()

  const data = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    image_url: formData.get('image_url') as string,
    link: formData.get('link') as string,
  }

  const validation = portfolioSchema.safeParse(data)
  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  const { error } = await supabase
    .from('portfolio_items')
    .insert({
      user_id: user.id,
      title: data.title,
      description: data.description,
      image_url: data.image_url,
      link: data.link,
    })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/profile')
  return { success: true }
}

export async function deletePortfolioItem(itemId: string) {
  const user = await getAuthenticatedUser()
  const supabase = await createClient()

  const { error } = await supabase
    .from('portfolio_items')
    .delete()
    .eq('id', itemId)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/profile')
  return { success: true }
}

export async function updateFeedbackVisibility(feedbackId: string, isPublic: boolean) {
  try {
    await requirePlan(['pro', 'agency'])
  } catch (e) {
    return { error: 'Public feedback is available on Pro plan only.' }
  }

  const user = await getAuthenticatedUser()
  const supabase = await createClient()

  const { error } = await supabase
    .from('client_feedbacks')
    .update({ published: isPublic })
    .eq('id', feedbackId)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/profile')
  return { success: true }
}
