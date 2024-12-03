import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const PAGE_SIZE = 1000;

const fetchAllConcerts = async () => {
  let concerts = [];
  let rangeStart = 0;

  while (true) {
    const { data, error } = await supabase
      .from("optimized_concerts")
      .select("*")
      .range(rangeStart, rangeStart + PAGE_SIZE - 1);

    if (error) {
      console.error("Error fetching concerts:", error);
      break;
    }

    concerts = concerts.concat(data);
    if (data.length < PAGE_SIZE) break;
    rangeStart += PAGE_SIZE;
  }

  return concerts;
};

const processConcerts = (concerts) => {
  return concerts.map((concert) => ({
    ...concert,
    artist: concert.artist || { name: concert.artist_name_string, url: null },
  }));
};

export default async function () {
  try {
    const concerts = await fetchAllConcerts();
    return processConcerts(concerts);
  } catch (error) {
    console.error("Error fetching and processing concerts data:", error);
    return [];
  }
}
