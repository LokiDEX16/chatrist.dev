import { createBrowserClient } from '@supabase/ssr';

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
}

// Check if the anon key looks valid (JWT starting with eyJ or newer sb_ format)
if (supabaseAnonKey && !supabaseAnonKey.startsWith('eyJ') && !supabaseAnonKey.startsWith('sb_')) {
  console.error(
    'Invalid NEXT_PUBLIC_SUPABASE_ANON_KEY format. The anon key should be a JWT token starting with "eyJ" or a key starting with "sb_". ' +
    'Please get the correct key from: Supabase Dashboard → Settings → API → anon public key'
  );
}

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
  );
}

// Browser client for use in React components
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
