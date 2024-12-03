import EleventyFetch from "@11ty/eleventy-fetch";

export default async function () {
  const API_KEY_PLAUSIBLE = process.env.API_KEY_PLAUSIBLE;
  const url =
    "https://plausible.io/api/v1/stats/breakdown?site_id=coryd.dev&period=6mo&property=event:page&limit=30";
  const res = EleventyFetch(url, {
    duration: "1d",
    type: "json",
    fetchOptions: {
      headers: {
        Authorization: `Bearer ${API_KEY_PLAUSIBLE}`,
      },
    },
  }).catch();
  const pages = await res;
  return pages["results"].filter((p) => p["page"].includes("posts"));
}
