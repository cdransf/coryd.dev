import slugify from "slugify";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json" assert { type: "json" };

countries.registerLocale(enLocale);

function sanitizeMediaString(str) {
  return slugify(
    str
      .normalize("NFD")
      .replace(/[\u0300-\u036f\u2010\-\.\?\(\)\[\]\{\}]/g, "")
      .replace(/\.{3}/g, ""),
    {
      replacement: "-",
      remove: /[#,&,+()$~%.'":*?<>{}]/g,
      lower: true,
    },
  );
}

export async function handler(event, context) {
  const {
    DIRECTUS_URL,
    DIRECTUS_TOKEN,
    ARTIST_IMPORT_TOKEN,
    ARTIST_FLOW_ID,
    ALBUM_FLOW_ID,
  } = process.env;

  const placeholderImageId = "4cef75db-831f-4f5d-9333-79eaa5bb55ee";
  const requestUrl = new URL(event.rawUrl);
  const providedToken = requestUrl.searchParams.get("token");

  if (!providedToken || providedToken !== ARTIST_IMPORT_TOKEN)
    return {
      statusCode: 401,
      body: "Unauthorized",
    };

  async function saveToDirectus(endpoint, payload) {
    try {
      const response = await fetch(`${DIRECTUS_URL}/items/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${DIRECTUS_TOKEN}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.errors?.[0]?.message || "Failed to save to Directus",
        );
      }

      return data.data;
    } catch (error) {
      console.error(`Error saving to ${endpoint}:`, error.message);
      throw error;
    }
  }

  async function findGenreIdByName(genreName) {
    try {
      const response = await fetch(
        `${DIRECTUS_URL}/items/genres?filter[name][_eq]=${encodeURIComponent(
          genreName.toLowerCase(),
        )}`,
        { headers: { Authorization: `Bearer ${DIRECTUS_TOKEN}` } },
      );
      const data = await response.json();

      return data.data?.[0]?.id || null;
    } catch (error) {
      console.error("Error fetching genre ID:", error.message);
      return null;
    }
  }

  const artistId = requestUrl.searchParams.get("artist_id");

  if (!artistId)
    return {
      statusCode: 400,
      body: "artist_id parameter is required",
    };

  let artistData;

  try {
    const artistResponse = await fetch(
      `${DIRECTUS_URL}/flows/trigger/${ARTIST_FLOW_ID}?artist_id=${artistId}&import_token=${ARTIST_IMPORT_TOKEN}`,
      { headers: { Authorization: `Bearer ${DIRECTUS_TOKEN}` } },
    );
    const artistResult = await artistResponse.json();
    artistData =
      artistResult.get_artist_data?.data?.MediaContainer?.Metadata?.[0];

    if (!artistData) throw new Error("Artist data not found");
  } catch (error) {
    console.error("Error fetching artist data:", error.message);
    return {
      statusCode: 500,
      body: "Error fetching artist data",
    };
  }

  const artistName = artistData.title || "";
  const artistKey = sanitizeMediaString(artistName);
  const countryName = artistData.Country?.[0]?.tag || "";
  const countryNameSlug = countryName.replace(/\s+/g, "-").toLowerCase();
  const countryIsoCode = countries.getAlpha2Code(countryName, "en") || "";
  const slug = `/music/artists/${artistKey}-${countryNameSlug}`;
  const description = artistData.summary || "";
  const mbid = artistData.Guid?.[0]?.id?.replace("mbid://", "") || "";
  const genreNames = artistData.Genre?.map((g) => g.tag.toLowerCase()) || [];
  let genreId = null;

  for (const genreName of genreNames) {
    genreId = await findGenreIdByName(genreName);
    if (genreId) break;
  }

  const artistPayload = {
    name: artistName,
    name_string: artistName,
    slug,
    description,
    mbid,
    tentative: true,
    genres: genreId,
    country: countryIsoCode,
    art: placeholderImageId,
  };

  let insertedArtist;

  try {
    insertedArtist = await saveToDirectus("artists", artistPayload);
  } catch (error) {
    console.error("Error saving artist:", error.message);
    return {
      statusCode: 500,
      body: "Error saving artist",
    };
  }

  let albumData;

  try {
    const albumResponse = await fetch(
      `${DIRECTUS_URL}/flows/trigger/${ALBUM_FLOW_ID}?artist_id=${artistId}&import_token=${ARTIST_IMPORT_TOKEN}`,
      { headers: { Authorization: `Bearer ${DIRECTUS_TOKEN}` } },
    );
    const albumResult = await albumResponse.json();

    albumData =
      albumResult.get_album_data?.data?.MediaContainer?.Metadata || [];
  } catch (error) {
    console.error("Error fetching album data:", error.message);
    return {
      statusCode: 500,
      body: "Error fetching album data",
    };
  }

  for (const album of albumData) {
    const albumName = album.title || "";
    const albumKey = `${artistKey}-${sanitizeMediaString(albumName)}`;
    const albumSlug = `/music/albums/${albumKey}`;
    const albumDescription = album.summary || "";
    const albumReleaseDate = album.originallyAvailableAt || "";
    const albumReleaseYear = albumReleaseDate
      ? new Date(albumReleaseDate).getFullYear()
      : null;
    const albumGenres = album.Genre?.map((g) => g.tag) || [];
    const albumMbid = album.Guid?.[0]?.id?.replace("mbid://", "") || null;

    const albumPayload = {
      name: albumName,
      key: albumKey,
      slug: albumSlug,
      mbid: albumMbid,
      description: albumDescription,
      release_year: albumReleaseYear,
      artist: insertedArtist.id,
      artist_name: artistName,
      genres: albumGenres,
      art: placeholderImageId,
      tentative: true,
    };

    try {
      await saveToDirectus("albums", albumPayload);
    } catch (error) {
      console.error("Error saving album:", error.message);
    }
  }

  return {
    statusCode: 200,
    body: "Artist and albums synced successfully",
  };
}
