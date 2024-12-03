import { createClient } from "@supabase/supabase-js";
import { DateTime } from "luxon";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const fetchAlbumReleases = async () => {
  const today = DateTime.utc().startOf("day").toSeconds();

  const { data, error } = await supabase
    .from("optimized_album_releases")
    .select("*");

  if (error) {
    console.error("Error fetching data:", error);
    return [];
  }

  const all = data
    .map((album) => {
      const releaseDate = DateTime.fromSeconds(album["release_timestamp"])
        .toUTC()
        .startOf("day");

      return {
        ...album,
        description: album["artist"]["description"],
        date: releaseDate.toLocaleString(DateTime.DATE_FULL),
        timestamp: releaseDate.toSeconds(),
      };
    })
    .sort((a, b) => a["timestamp"] - b["timestamp"]);

  const upcoming = all.filter((album) => album["release_timestamp"] > today && album['total_plays'] === 0);

  return { all, upcoming };
};

export default async function () {
  try {
    return await fetchAlbumReleases();
  } catch (error) {
    console.error("Error fetching and processing album releases:", error);
    return [];
  }
}
