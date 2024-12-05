import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default async function fetchHeaders() {
  const { data, error } = await supabase.from("optimized_headers").select("*");

  if (error) {
    console.error("Error fetching header data:", error);
    return [];
  }

  return data;
}
