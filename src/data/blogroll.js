import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const fetchBlogroll = async () => {
  const { data, error } = await supabase.from("optimized_blogroll").select("*");

  if (error) {
    console.error("Error fetching authors for the blogroll:", error);
    return [];
  }

  return data;
};

export default async function () {
  try {
    return await fetchBlogroll();
  } catch (error) {
    console.error("Error fetching and processing the blogroll:", error);
    return [];
  }
}
