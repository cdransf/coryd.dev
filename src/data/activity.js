import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default async function fetchActivity() {
  const { data, error } = await supabase
    .from("optimized_all_activity")
    .select("feed");

  if (error) {
    console.error("Error fetching activity data:", error);
    return [];
  }

  const [{ feed } = {}] = data;

  return feed?.filter((item) => item["feed"] !== null) || [];
}
