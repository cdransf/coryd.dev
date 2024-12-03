import { createClient } from "@supabase/supabase-js";
import { parseCountryField } from "../../config/utilities/index.js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const PAGE_SIZE = 1000;

const fetchAllArtists = async () => {
  let artists = [];
  let rangeStart = 0;

  while (true) {
    const { data, error } = await supabase
      .from("optimized_artists")
      .select("*")
      .range(rangeStart, rangeStart + PAGE_SIZE - 1);

    if (error) {
      console.error("Error fetching artists:", error);
      break;
    }

    artists = artists.concat(data);
    if (data.length < PAGE_SIZE) break;
    rangeStart += PAGE_SIZE;
  }

  return artists;
};

const processArtists = (artists) => {
  return artists.map((artist) => ({
    ...artist,
    country: parseCountryField(artist["country"]),
  }));
};

export default async function () {
  try {
    const artists = await fetchAllArtists();
    return processArtists(artists);
  } catch (error) {
    console.error("Error fetching and processing artists data:", error);
    return [];
  }
}
