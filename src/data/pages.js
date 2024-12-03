import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env["SUPABASE_URL"];
const SUPABASE_KEY = process.env["SUPABASE_KEY"];
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const PAGE_SIZE = 250;

const fetchAllPages = async () => {
  let pages = [];
  let page = 0;
  let fetchMore = true;

  while (fetchMore) {
    const { data, error } = await supabase
      .from("optimized_pages")
      .select("*")
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (error) {
      console.error("Error fetching pages:", error);
      return pages;
    }

    if (data.length < PAGE_SIZE) fetchMore = false;

    pages = pages.concat(data);
    page++;
  }

  return pages;
};

export default async function () {
  try {
    return await fetchAllPages();
  } catch (error) {
    console.error("Error fetching and processing pages:", error);
    return [];
  }
}
