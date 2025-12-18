// Quick test script to verify Supabase connection
// Run with: node test-supabase-connection.js

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables!');
  console.log('Make sure .env.local exists with:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=...');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=...');
  process.exit(1);
}

console.log('🔗 Testing Supabase connection...');
console.log('URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

// Test connection by checking if assessments table exists
supabase
  .from('assessments')
  .select('count')
  .limit(1)
  .then(({ data, error }) => {
    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        console.error('❌ Table "assessments" does not exist!');
        console.log('\n📝 Please run the SQL migration:');
        console.log('   1. Go to Supabase Dashboard > SQL Editor');
        console.log('   2. Copy contents of supabase/migrations/create_assessments_table.sql');
        console.log('   3. Run the SQL');
      } else {
        console.error('❌ Connection error:', error.message);
      }
    } else {
      console.log('✅ Connection successful!');
      console.log('✅ Assessments table exists and is accessible');
    }
  })
  .catch((err) => {
    console.error('❌ Unexpected error:', err.message);
  });






