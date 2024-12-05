import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const PAGE_SIZE = 1000;

const fetchAllMovies = async () => {
  let movies = [];
  let rangeStart = 0;

  while (true) {
    const { data, error } = await supabase
      .from("optimized_movies")
      .select("*")
      .range(rangeStart, rangeStart + PAGE_SIZE - 1);

    if (error) {
      console.error("Error fetching movies:", error);
      break;
    }

    movies = movies.concat(data);

    if (data.length < PAGE_SIZE) break;
    rangeStart += PAGE_SIZE;
  }

  return movies;
};

export default async function () {
  try {
    const movies = await fetchAllMovies();
    const favoriteMovies = movies.filter((movie) => movie["favorite"]);
    const now = new Date();

    const recentlyWatchedMovies = movies.filter((movie) => {
      const lastWatched = movie["last_watched"];
      if (!lastWatched) return false;

      const lastWatchedDate = new Date(lastWatched);
      if (isNaN(lastWatchedDate.getTime())) return false;

      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      return lastWatchedDate >= sixMonthsAgo;
    });

    return {
      movies,
      watchHistory: movies.filter((movie) => movie["last_watched"]),
      recentlyWatched: recentlyWatchedMovies,
      favorites: favoriteMovies.sort((a, b) =>
        a["title"].localeCompare(b["title"]),
      ),
      feed: movies.filter((movie) => movie["feed"]),
    };
  } catch (error) {
    console.error("Error fetching and processing movies data:", error);
    return {
      movies: [],
      watchHistory: [],
      recentlyWatched: [],
      favorites: [],
      feed: [],
    };
  }
}
