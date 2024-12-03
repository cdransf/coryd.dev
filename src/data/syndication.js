import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default async function fetchSyndication() {
  const { data, error } = await supabase
    .from("optimized_syndication")
    .select("syndication");

  if (error) {
    console.error("Error fetching syndication data:", error);
    return [];
  }

  const [{ syndication } = {}] = data;

  return syndication?.filter((item) => item["syndication"] !== null) || [];
}
