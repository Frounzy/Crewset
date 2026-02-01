
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://seryppmrwqholncrvvyp.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlcnlwcG1yd3Fob2xuY3J2dnlwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTQ1NzU0MiwiZXhwIjoyMDg1MDMzNTQyfQ.FEusoYVqwQ0MwVOu7-li8Ha8uAOYy80G_ZuB8mCyh3Y';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function checkTeamStatus() {
  console.log('Checking team status...');

  // 1. Get all users
  const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
  if (usersError) {
    console.error('Error listing users:', usersError);
    return;
  }

  // Find our main user (erolgblk2727@gmail.com)
  const mainUser = users.find(u => u.email === 'erolgblk2727@gmail.com');
  if (!mainUser) {
    console.error('Main user not found');
    return;
  }
  console.log('Main User:', mainUser.email, mainUser.id);

  // 2. Check Subscription
  const { data: subscription, error: subError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', mainUser.id)
    .single();

  if (subError) {
    console.log('Subscription not found or error:', subError.message);
  } else {
    console.log('Subscription:', subscription);
  }

  // 3. Check Organization
  const { data: members, error: memError } = await supabase
    .from('organization_members')
    .select('*, organizations(*)')
    .eq('user_id', mainUser.id);

  if (memError) {
    console.error('Error fetching members:', memError);
  } else {
    console.log('Organization Memberships:', JSON.stringify(members, null, 2));
  }
}

checkTeamStatus();
