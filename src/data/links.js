import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const PAGE_SIZE = 1000;

const fetchAllLinks = async () => {
  let links = [];
  let page = 0;
  let fetchMore = true;

  while (fetchMore) {
    const { data, error } = await supabase
      .from("optimized_links")
      .select("*")
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (error) {
      console.error("Error fetching links:", error);
      return links;
    }

    if (data.length < PAGE_SIZE) fetchMore = false;

    links = links.concat(data);
    page++;
  }

  return links;
};

export default async function () {
  try {
    return await fetchAllLinks();
  } catch (error) {
    console.error("Error fetching and processing links:", error);
    return [];
  }
}
