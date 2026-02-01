
const { createClient } = require('@supabase/supabase-js');

// Hardcoded keys from .env.local
const supabaseUrl = 'https://seryppmrwqholncrvvyp.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlcnlwcG1yd3Fob2xuY3J2dnlwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTQ1NzU0MiwiZXhwIjoyMDg1MDMzNTQyfQ.FEusoYVqwQ0MwVOu7-li8Ha8uAOYy80G_ZuB8mCyh3Y';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function checkColumns() {
  console.log('Checking profiles table columns...');
  // Fetch one row to see structure
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error:', error);
    return;
  }

  if (data && data.length > 0) {
    console.log('Columns:', Object.keys(data[0]));
  } else {
    console.log('No profiles found, cannot determine columns easily without introspection.');
  }
}

checkColumns();
