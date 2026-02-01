
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Load .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8')
  envConfig.split('\n').forEach((line) => {
  const match = line.match(/^([^=]+)=(.*)$/)
  if (match) {
    const key = match[1].trim()
    let value = match[2].trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    if (key && value) {
      process.env[key] = value
    }
  }
})
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing Supabase environment variables.')
  console.error('Make sure .env.local exists and contains NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.')
  process.exit(1)
}

// Check for placeholder/invalid keys
if (supabaseServiceRoleKey === 'your-service-role-key' || supabaseServiceRoleKey.length < 20) {
    console.error('Invalid SUPABASE_SERVICE_ROLE_KEY detected.')
    console.error('Please update .env.local with your actual Supabase Service Role Key from the Supabase Dashboard > Project Settings > API.')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function main() {
  const { data: { users }, error } = await supabase.auth.admin.listUsers()

  if (error) {
    console.error('Error fetching users:', error)
    return
  }

  if (!users || users.length === 0) {
    console.log('No users found.')
    return
  }

  console.log(`Found ${users.length} users.`)

  // If a specific email is provided as an argument
  const targetEmail = process.argv[2]
  
  let userToUpgrade = null

  if (targetEmail) {
    userToUpgrade = users.find(u => u.email === targetEmail)
    if (!userToUpgrade) {
      console.error(`User with email ${targetEmail} not found.`)
      console.log('Available users:')
      users.forEach(u => console.log(`- ${u.email} (${u.id})`))
      return
    }
  } else if (users.length === 1) {
    userToUpgrade = users[0]
    console.log(`Only one user found, selecting automatically: ${userToUpgrade.email}`)
  } else {
    console.log('Multiple users found. Please specify an email address as an argument.')
    users.forEach(u => console.log(`- ${u.email} (${u.id})`))
    return
  }

  console.log(`Upgrading user ${userToUpgrade.email} (${userToUpgrade.id}) to PRO...`)

  // Update subscriptions table
  // Check if subscription exists
  const { data: subscription, error: subError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userToUpgrade.id)
    .single()

  if (subError && subError.code !== 'PGRST116') { // PGRST116 is "Row not found"
    console.error('Error checking subscription:', subError)
    return
  }

  if (subscription) {
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({ 
        plan: 'pro',
        status: 'active',
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
      })
      .eq('user_id', userToUpgrade.id)
    
    if (updateError) {
      console.error('Error updating subscription:', updateError)
    } else {
      console.log('Subscription updated to PRO successfully!')
    }
  } else {
    const { error: insertError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userToUpgrade.id,
        plan: 'pro',
        status: 'active',
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      })
    
    if (insertError) {
      console.error('Error creating subscription:', insertError)
    } else {
      console.log('New PRO subscription created successfully!')
    }
  }
}

main()
