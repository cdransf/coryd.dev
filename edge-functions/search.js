import { createClient } from "@supabase/supabase-js";

export default async (req) => {
  const supabaseUrl = Netlify.env.get("SUPABASE_URL");
  const supabaseKey = Netlify.env.get("SUPABASE_KEY");
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const url = new URL(req.url);
    const searchParams = url.searchParams;

    const query = searchParams.get("q")?.trim() || "";
    const rawTypes = searchParams.get("type") || "";
    const types = rawTypes ? rawTypes.split(",") : null;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
    const offset = (page - 1) * pageSize;

    if (!query) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid 'q' parameter" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const { data, error } = await supabase.rpc("search_optimized_index", {
      search_query: query,
      page_size: pageSize,
      page_offset: offset,
      types: types && types.length ? types : null,
    });

    if (error) {
      console.error("Error fetching search data:", error.message);
      return new Response(
        JSON.stringify({
          results: [],
          total: 0,
          error: error.message,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    const total = data.length > 0 ? data[0].total_count : 0;
    const results = data.map(({ total_count, ...item }) => item);

    return new Response(JSON.stringify({ results, total, page, pageSize }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Unexpected error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
