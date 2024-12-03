import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const PAGE_SIZE = 1000;

const fetchAllSitemapEntries = async () => {
  let sitemapEntries = [];
  let rangeStart = 0;

  while (true) {
    const { data, error } = await supabase
      .from("optimized_sitemap")
      .select("*")
      .range(rangeStart, rangeStart + PAGE_SIZE - 1);

    if (error) {
      console.error("Error fetching sitemap entries:", error);
      break;
    }

    sitemapEntries = sitemapEntries.concat(data);

    if (data.length < PAGE_SIZE) break;

    rangeStart += PAGE_SIZE;
  }

  return sitemapEntries;
};

export default async function fetchSitemap() {
  try {
    const sitemapEntries = await fetchAllSitemapEntries();
    return sitemapEntries;
  } catch (error) {
    console.error("Error fetching sitemap data:", error);
    return [];
  }
}
