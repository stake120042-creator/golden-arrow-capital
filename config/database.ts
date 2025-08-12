import { createClient } from '@supabase/supabase-js';

// Environment variables with fallbacks for build time
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

// Runtime validation (not during build)
if (typeof window !== 'undefined' || process.env.NODE_ENV === 'development') {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.warn('⚠️ Missing NEXT_PUBLIC_SUPABASE_URL - using placeholder');
  }
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('⚠️ Missing NEXT_PUBLIC_SUPABASE_ANON_KEY - using placeholder');
  }
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Legacy interface for backward compatibility with existing code
export default {
  query: async (text: string, params?: any[]) => {
    // If database is disabled, return mock response
    if (process.env.DB_DISABLED === 'true') {
      return { rows: [], rowCount: 0 };
    }
    
    console.warn('⚠️ Using legacy query interface. Consider migrating to Supabase client directly.');
    
    // For now, this is a placeholder. You should migrate existing queries to use supabase client
    throw new Error('Legacy query interface not supported with Supabase. Please migrate to use supabase client directly.');
  },
  
  end: async () => {
    // Supabase handles connection management automatically
    console.log('ℹ️ Supabase handles connection management automatically');
  },

  // Add Supabase client for direct access
  supabase
};
