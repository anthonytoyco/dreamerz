import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Fetch all predefined keywords from Supabase
 */
export async function getAllKeywords() {
  const { data, error } = await supabase
    .from("keywords")
    .select("id,name");

  if (error) throw error;
  return data ?? [];
}
