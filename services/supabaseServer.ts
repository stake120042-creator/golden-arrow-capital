import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client using service role for RPC and RLS-safe operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if environment variables are properly configured
if (!supabaseUrl || !serviceKey) {
  console.error('❌ Supabase server configuration is missing:');
  if (!supabaseUrl) console.error('   - NEXT_PUBLIC_SUPABASE_URL is not set');
  if (!serviceKey) console.error('   - SUPABASE_SERVICE_KEY is not set');
  console.error('Please create a .env.local file with the required environment variables.');
  console.error('See .env.example for the required variables.');
}

// Create client with fallbacks for development
export const supabaseServer = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  serviceKey || 'placeholder-service-key'
);

console.log('🔍 Supabase server configuration:', supabaseServer);

export default supabaseServer;





