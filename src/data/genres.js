import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const fetchGenres = async () => {
  const { data, error } = await supabase.from("optimized_genres").select("*");

  if (error) {
    console.error("Error fetching genres with artists:", error);
    return [];
  }

  return data;
};

export default async function () {
  try {
    return await fetchGenres();
  } catch (error) {
    console.error("Error fetching and processing genres:", error);
    return [];
  }
}
