import { XMLParser } from "fast-xml-parser";
import { convert } from "html-to-text";
import { createClient } from "@supabase/supabase-js";

const BASE_URL = "https://coryd.dev";

async function addMastodonUrlToPost(supabase, slug, mastodonPostUrl) {
  const { error } = await supabase
    .from("posts")
    .update({ mastodon_url: mastodonPostUrl })
    .eq("slug", slug);

  if (error) {
    console.error("Error updating post in 'posts' table:", error.message);
  } else {
    console.log(`Updated post with Mastodon URL: ${mastodonPostUrl}`);
  }
}

function truncateContent(title, description, link, maxLength) {
  const baseLength = `${title}\n\n${link}`.length;
  const availableSpace = maxLength - baseLength - 4;
  let truncatedDescription = description;

  if (description.length > availableSpace)
    truncatedDescription =
      description
        .substring(0, availableSpace)
        .split(" ")
        .slice(0, -1)
        .join(" ") + "...";

  truncatedDescription = truncatedDescription.replace(/\s+([.,!?;:])/g, "$1");

  return `${title}\n\n${truncatedDescription}\n\n${link}`;
}

async function fetchRSSFeed(rssFeedUrl) {
  const response = await fetch(rssFeedUrl);
  const rssText = await response.text();
  const parser = new XMLParser();
  const rssData = parser.parse(rssText);
  const items = rssData.rss.channel.item;

  return items.map((item) => ({
    title: item.title,
    link: item.link,
    description: item.description,
  }));
}

async function postToMastodon(apiUrl, accessToken, content) {
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status: content }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Error posting to Mastodon: ${response.statusText} - ${errorText}`,
    );
  }

  const responseData = await response.json();
  return responseData.url;
}

async function fetchFromSupabase(supabase, link) {
  const { data, error } = await supabase
    .from("mastodon_posts")
    .select("link")
    .eq("link", link)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching from Supabase:", error.message);
    return null;
  }

  return data;
}

async function storeInSupabase(supabase, link, timestamp) {
  const { error } = await supabase.from("mastodon_posts").insert([
    {
      link,
      created_at: timestamp,
    },
  ]);

  if (error) {
    console.error("Error storing in Supabase:", error.message);
  } else {
    console.log("Successfully stored processed link in 'mastodon_posts'");
  }
}

async function handleMastodonPost(env, supabase) {
  const mastodonApiUrl = "https://follow.coryd.dev/api/v1/statuses";
  const accessToken = env.MASTODON_ACCESS_TOKEN;
  const rssFeedUrl = "https://coryd.dev/feeds/syndication.xml";

  try {
    const latestItems = await fetchRSSFeed(rssFeedUrl);

    for (let i = latestItems.length - 1; i >= 0; i--) {
      const item = latestItems[i];
      const existingPost = await fetchFromSupabase(supabase, item.link);

      if (existingPost) continue;

      const title = item.title;
      const link = item.link;
      const maxLength = 500;
      const plainTextDescription = convert(item.description, {
        wordwrap: false,
        selectors: [
          { selector: "a", options: { ignoreHref: true } },
          { selector: "h1", options: { uppercase: false } },
          { selector: "h2", options: { uppercase: false } },
          { selector: "h3", options: { uppercase: false } },
          { selector: "*", format: "block" },
        ],
      });
      const cleanedDescription = plainTextDescription
        .replace(/\s+/g, " ")
        .trim();
      const content = truncateContent(
        title,
        cleanedDescription,
        link,
        maxLength,
      );
      const mastodonPostUrl = await postToMastodon(
        mastodonApiUrl,
        accessToken,
        content,
      );
      const timestamp = new Date().toISOString();

      await storeInSupabase(supabase, item.link, timestamp);

      if (link.includes("coryd.dev/posts")) {
        const slug = link.replace(BASE_URL, "");
        await addMastodonUrlToPost(supabase, slug, mastodonPostUrl);
      }

      console.log(`Posted and stored URL: ${link}`);
    }

    console.log("RSS processed successfully");
  } catch (error) {
    console.error("Error in Mastodon posting process:", error);
  }
}

export async function handler(event, context) {
  const env = process.env;

  try {
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
    await handleMastodonPost(env, supabase);
    return {
      statusCode: 200,
      body: "RSS processed successfully",
    };
  } catch (error) {
    console.error("Error in Netlify function:", error);
    return {
      statusCode: 500,
      body: "Internal Server Error",
    };
  }
}
