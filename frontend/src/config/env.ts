const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Copy .env.example to .env and fill in your project credentials.',
  );
}

const groqApiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY ?? '';
const guideGroqApiKey = process.env.EXPO_PUBLIC_GUIDE_GROQ_API_KEY ?? '';
const catApiKey = process.env.EXPO_PUBLIC_CAT_API_KEY ?? '';
const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? '';

export const env = {
  supabaseUrl,
  supabaseAnonKey,
  groqApiKey,
  guideGroqApiKey,
  catApiKey,
  apiUrl,
} as const;
