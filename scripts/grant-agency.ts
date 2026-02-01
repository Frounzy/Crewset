
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

  console.log(`Upgrading user ${userToUpgrade.email} (${userToUpgrade.id}) to AGENCY...`)

  const { data: subscription, error: subError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userToUpgrade.id)
    .single()

  if (subError && subError.code !== 'PGRST116') {
    console.error('Error checking subscription:', subError)
    return
  }

  const subscriptionData = {
    plan: 'agency',
    status: 'active',
    current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  }

  if (subscription) {
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update(subscriptionData)
      .eq('user_id', userToUpgrade.id)
    
    if (updateError) {
      console.error('Error updating subscription:', updateError)
    } else {
      console.log('Subscription updated to AGENCY successfully!')
    }
  } else {
    const { error: insertError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userToUpgrade.id,
        ...subscriptionData
      })
    
    if (insertError) {
      console.error('Error creating subscription:', insertError)
    } else {
      console.log('New AGENCY subscription created successfully!')
    }
  }
}

main()
