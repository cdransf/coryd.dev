import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const PAGE_SIZE = 500;

const fetchAllRobots = async () => {
  let robots = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("robots")
      .select("user_agent")
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      console.error("Error fetching robot data:", error);
      return [];
    }

    robots = robots.concat(data);
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return robots
    .map((robot) => robot["user_agent"])
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
};

export default async function () {
  try {
    return await fetchAllRobots();
  } catch (error) {
    console.error("Error fetching and processing robot data:", error);
    return [];
  }
}
