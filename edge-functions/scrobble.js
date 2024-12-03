import { createClient } from "@supabase/supabase-js";
import slugify from "slugify";

const sanitizeMediaString = (str) => {
  const sanitizedString = str
    .normalize("NFD")
    .replace(/[\u0300-\u036f\u2010\-\.\?\(\)\[\]\{\}]/g, "")
    .replace(/\.{3}/g, "");
  return slugify(sanitizedString, {
    replacement: "-",
    remove: /[#,&,+()$~%.'":*?<>{}]/g,
    lower: true,
  });
};

const sendEmail = async (subject, text, authHeader) => {
  const emailData = new URLSearchParams({
    from: "coryd.dev <hi@admin.coryd.dev>",
    to: "hi@coryd.dev",
    subject: subject,
    text: text,
  }).toString();

  const response = await fetch("https://api.forwardemail.net/v1/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: authHeader,
    },
    body: emailData,
  });

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(`Failed to send email: ${responseText}`);
  }
};

const parseMultipartFormData = (body, boundary) => {
  const parts = body.split(`--${boundary}`).filter((part) => part.trim());
  const formData = {};

  parts.forEach((part) => {
    const [headers, value] = part.split("\r\n\r\n");
    const nameMatch = headers.match(/name="(.+?)"/);
    if (nameMatch) {
      const name = nameMatch[1];
      formData[name] = value.trim().replace(/\r\n$/, "");
    }
  });

  return formData;
};

export default async (req) => {
  const supabaseUrl = Netlify.env.get("SUPABASE_URL");
  const supabaseKey = Netlify.env.get("SUPABASE_KEY");
  const FORWARDEMAIL_API_KEY = Netlify.env.get("FORWARDEMAIL_API_KEY");
  const ACCOUNT_ID_PLEX = Netlify.env.get("ACCOUNT_ID_PLEX");
  const authHeader = `Basic ${btoa(`${FORWARDEMAIL_API_KEY}:`)}`;
  const supabase = createClient(supabaseUrl, supabaseKey);

  let id;

  try {
    const queryParams = new URLSearchParams(req.url.split("?")[1]);
    id = queryParams.get("id");

    if (!id || id !== ACCOUNT_ID_PLEX) {
      return new Response(
        JSON.stringify({
          status: "Forbidden",
          message: "Invalid or missing ID",
        }),
        { status: 403 },
      );
    }
  } catch (error) {
    console.error("Error parsing query parameters:", error);

    return new Response(
      JSON.stringify({
        status: "Bad request",
        message: "Oops! Bad request.",
      }),
      { status: 400 },
    );
  }

  const contentType = req.headers.get("content-type") || "";

  if (!contentType.includes("multipart/form-data")) {
    return new Response(
      JSON.stringify({
        status: "Bad request",
        message: "Invalid Content-Type. Expected multipart/form-data.",
      }),
      { status: 400 },
    );
  }

  try {
    const boundary = contentType.split("boundary=")[1];
    if (!boundary) throw new Error("Missing boundary in Content-Type");

    const rawBody = await req.text();
    const formData = parseMultipartFormData(rawBody, boundary);
    const payload = JSON.parse(formData.payload);

    if (payload?.event === "media.scrobble") {
      const artistName = payload["Metadata"]["grandparentTitle"];
      const albumName = payload["Metadata"]["parentTitle"];
      const trackName = payload["Metadata"]["title"];
      const listenedAt = Math.floor(Date.now() / 1000);
      const artistKey = sanitizeMediaString(artistName);
      const albumKey = `${artistKey}-${sanitizeMediaString(albumName)}`;

      let { data: artistData, error: artistError } = await supabase
        .from("artists")
        .select("*")
        .ilike("name_string", artistName)
        .single();

      if (artistError && artistError.code === "PGRST116") {
        await supabase.from("artists").insert([
          {
            mbid: null,
            art: "4cef75db-831f-4f5d-9333-79eaa5bb55ee",
            name: artistName,
            slug: "/music",
            tentative: true,
            total_plays: 0,
          },
        ]);

        await sendEmail(
          "New tentative artist record",
          `A new tentative artist record was inserted:\n\nArtist: ${artistName}\nKey: ${artistKey}`,
          authHeader,
        );

        ({ data: artistData } = await supabase
          .from("artists")
          .select("*")
          .ilike("name_string", artistName)
          .single());
      }

      let { data: albumData, error: albumError } = await supabase
        .from("albums")
        .select("*")
        .ilike("key", albumKey)
        .single();

      if (albumError && albumError.code === "PGRST116") {
        await supabase.from("albums").insert([
          {
            mbid: null,
            art: "4cef75db-831f-4f5d-9333-79eaa5bb55ee",
            key: albumKey,
            name: albumName,
            tentative: true,
            total_plays: 0,
            artist: artistData.id,
          },
        ]);

        await sendEmail(
          "New tentative album record",
          `A new tentative album record was inserted:\n\nAlbum: ${albumName}\nKey: ${albumKey}\nArtist: ${artistName}`,
          authHeader,
        );

        ({ data: albumData } = await supabase
          .from("albums")
          .select("*")
          .ilike("key", albumKey)
          .single());
      }

      await supabase.from("listens").insert([
        {
          artist_name: artistData.name_string || artistName,
          album_name: albumData.name || albumName,
          track_name: trackName,
          listened_at: listenedAt,
          album_key: albumKey,
        },
      ]);

      console.log("Listen record inserted successfully");
    }

    return new Response(JSON.stringify({ status: "success" }), { status: 200 });
  } catch (e) {
    console.error("Error occurred during request processing:", e.message, e);

    return new Response(
      JSON.stringify({ status: "error", message: "Oops! Error." }),
      { status: 500 },
    );
  }
};
