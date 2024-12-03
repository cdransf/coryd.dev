import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const PAGE_SIZE = 1000;

const fetchDataFromView = async (viewName) => {
  let rows = [];
  let rangeStart = 0;

  while (true) {
    const { data, error } = await supabase
      .from(viewName)
      .select("*")
      .range(rangeStart, rangeStart + PAGE_SIZE - 1);

    if (error) {
      console.error(`Error fetching data from view ${viewName}:`, error);
      break;
    }

    if (data.length === 0) break;

    rows = [...rows, ...data];

    if (data.length < PAGE_SIZE) break;
    rangeStart += PAGE_SIZE;
  }

  return rows;
};

export default async function fetchMusicData() {
  try {
    const [
      recentTracks,
      weekTracks,
      weekArtists,
      weekAlbums,
      weekGenres,
      monthTracks,
      monthArtists,
      monthAlbums,
      monthGenres,
    ] = await Promise.all([
      fetchDataFromView("recent_tracks"),
      fetchDataFromView("week_tracks"),
      fetchDataFromView("week_artists"),
      fetchDataFromView("week_albums"),
      fetchDataFromView("week_genres"),
      fetchDataFromView("month_tracks"),
      fetchDataFromView("month_artists"),
      fetchDataFromView("month_albums"),
      fetchDataFromView("month_genres"),
    ]);

    return {
      recent: recentTracks,
      week: {
        tracks: weekTracks,
        artists: weekArtists,
        albums: weekAlbums,
        genres: weekGenres,
        totalTracks: weekTracks
          .reduce((acc, track) => acc + track.plays, 0)
          .toLocaleString("en-US"),
      },
      month: {
        tracks: monthTracks,
        artists: monthArtists,
        albums: monthAlbums,
        genres: monthGenres,
        totalTracks: monthTracks
          .reduce((acc, track) => acc + track.plays, 0)
          .toLocaleString("en-US"),
      },
    };
  } catch (error) {
    console.error("Error fetching and processing music data:", error);
    return {};
  }
}
