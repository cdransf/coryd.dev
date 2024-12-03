import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env["SUPABASE_URL"];
const SUPABASE_KEY = process.env["SUPABASE_KEY"];
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const PAGE_SIZE = 1000;

const fetchAllPosts = async () => {
  let posts = [];
  let page = 0;
  let fetchMore = true;

  while (fetchMore) {
    const { data, error } = await supabase
      .from("optimized_posts")
      .select("*")
      .order("date", { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (error) {
      console.error("Error fetching posts:", error);
      return posts;
    }

    if (data.length < PAGE_SIZE) fetchMore = false;

    posts = posts.concat(data);
    page++;
  }

  return posts;
};

export default async function () {
  try {
    return await fetchAllPosts();
  } catch (error) {
    console.error("Error fetching and processing posts:", error);
    return [];
  }
}
