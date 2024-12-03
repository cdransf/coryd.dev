import { DateTime } from "luxon";
import ics from "ics";

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
  const { sitemap, pages } = data;
  const staticMap = [
    { url: "https://coryd.dev/books" },
    { url: "https://coryd.dev/books/years/2018" },
    { url: "https://coryd.dev/books/years/2019" },
    { url: "https://coryd.dev/books/years/2020" },
    { url: "https://coryd.dev/books/years/2021" },
    { url: "https://coryd.dev/books/years/2022" },
    { url: "https://coryd.dev/books/years/2023" },
    { url: "https://coryd.dev/books/years/2024" },
    { url: "https://coryd.dev/music" },
    { url: "https://coryd.dev/music/this-week/albums" },
    { url: "https://coryd.dev/music/this-week/artists" },
    { url: "https://coryd.dev/music/this-month" },
    { url: "https://coryd.dev/music/this-month/albums" },
    { url: "https://coryd.dev/music/this-month/artists" },
    { url: "https://coryd.dev/watching" },
    { url: "https://coryd.dev/watching/favorites/movies" },
    { url: "https://coryd.dev/watching/favorites/shows" },
    { url: "https://coryd.dev/watching/recent/movies" },
    { url: "https://coryd.dev/watching/recent/shows" },
    { url: "https://coryd.dev/posts" },
    { url: "https://coryd.dev/links" },
  ];

  return [...sitemap, ...staticMap];
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
