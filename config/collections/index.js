import { DateTime } from "luxon";
import ics from "ics";
import { staticSitemapPages } from "../constants.js";

export const popularPosts = (collection) => {
  const collectionData = collection.getAll()[0];
  const { data } = collectionData;
  const { posts, analytics } = data;

  return posts
    .filter((post) => {
      if (analytics.find((p) => p.page.includes(post.url))) return true;
    })
    .sort((a, b) => {
      const visitors = (page) =>
        analytics.filter((p) => p.page.includes(page.url)).pop()?.visitors;
      return visitors(b) - visitors(a);
    });
};

export const sitemap = (collection) => {
  const collectionData = collection.getAll()[0];
  const { data } = collectionData;
  const { sitemap } = data;
  return [...sitemap, ...staticSitemapPages];
};

export const albumReleasesCalendar = (collection) => {
  const collectionData = collection.getAll()[0];
  const { data } = collectionData;
  const {
    albumReleases: { all },
  } = data;
  if (!all || all.length === 0) return "";

  const events = all
    .map((album) => {
      const date = DateTime.fromISO(album["release_date"]);
      if (!date.isValid) return null;

      return {
        start: [date.year, date.month, date.day],
        startInputType: "local",
        startOutputType: "local",
        title: `Release: ${album["artist"]["name"]} - ${album["title"]}`,
        description: `Check out this new album release: ${album["url"]}. Read more about ${album["artist"]["name"]} at https://coryd.dev${album["artist"]["url"]}`,
        url: album["url"],
        uid: `${date.toFormat("yyyyMMdd")}-${album["artist"]["name"]}-${
          album["title"]
        }@coryd.dev`,
        timestamp: DateTime.now().toUTC().toFormat("yyyyMMdd'T'HHmmss'Z'"),
      };
    })
    .filter((event) => event !== null);

  const { error, value } = ics.createEvents(events, {
    calName: "Album releases calendar / coryd.dev",
  });

  if (error) {
    console.error("Error creating events: ", error);
    events.forEach((event, index) => {
      console.error(`Event ${index}:`, event);
    });
    return "";
  }

  return value;
};
