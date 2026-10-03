const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function testSupabaseConnection() {
  console.log('Testing Supabase connection...');
  console.log('URL:', process.env.SUPABASE_URL);
  console.log('Key:', process.env.SUPABASE_ANON_KEY?.substring(0, 20) + '...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase.from('schools').select('count').limit(1);
    
    if (error) {
      console.error('❌ Supabase connection failed:', error);
      return false;
    }
    
    console.log('✅ Supabase connection successful!');
    console.log('Data:', data);
    
    // Test inserting a record
    const { data: insertData, error: insertError } = await supabase
      .from('schools')
      .select('*')
      .limit(1);
    
    if (insertError) {
      console.error('❌ Query failed:', insertError);
    } else {
      console.log('✅ Query successful!');
      console.log('Schools:', insertData);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

testSupabaseConnection();
