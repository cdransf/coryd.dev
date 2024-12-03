import { createClient } from "@supabase/supabase-js";

export default async (req) => {
  const supabaseUrl = Netlify.env.get("SUPABASE_URL");
  const supabaseKey = Netlify.env.get("SUPABASE_KEY");
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase
    .from("optimized_latest_listen")
    .select("*")
    .single();

  const headers = {
    "Content-Type": "application/json",
    "Cache-Control": "public, s-maxage=360, stale-while-revalidate=1080",
  };

  if (error) {
    console.error("Error fetching data:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch the latest track" }),
      { headers },
    );
  }

  if (!data)
    return new Response(JSON.stringify({ message: "No recent tracks found" }), {
      headers,
    });

  const genreEmoji = data.genre_emoji;
  const emoji = data.artist_emoji || genreEmoji;

  return new Response(
    JSON.stringify({
      content: `${emoji || "🎧"} ${
        data.track_name
      } by <a href="https://coryd.dev${data.url}">${data.artist_name}</a>`,
    }),
    { headers },
  );
};
