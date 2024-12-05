import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const fetchAlbumReleases = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTimestamp = today.getTime() / 1000;

  const { data, error } = await supabase
    .from("optimized_album_releases")
    .select("*");

  if (error) {
    console.error("Error fetching data:", error);
    return [];
  }

  const all = data
    .map((album) => {
      const releaseDate = new Date(album["release_timestamp"] * 1000);

      return {
        ...album,
        description: album["artist"]["description"],
        date: releaseDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      };
    })
    .sort((a, b) => a["release_timestamp"] - b["release_timestamp"]);

  const upcoming = all.filter(
    (album) =>
      album["release_timestamp"] > todayTimestamp && album["total_plays"] === 0,
  );

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
