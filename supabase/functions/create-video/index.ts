import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";
import { buildPlaybackUrl, slugify } from "../_shared/video-utils.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const requiredEnv = (name: string): string => {
  const value = Deno.env.get(name);
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

const json = (status: number, payload: Record<string, unknown>) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  try {
    const libraryId = requiredEnv("BUNNY_STREAM_LIBRARY_ID");
    const accessKey = requiredEnv("BUNNY_STREAM_API_KEY");
    const supabaseUrl = requiredEnv("SUPABASE_URL");
    const serviceRoleKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
    const cdnHost = Deno.env.get("BUNNY_STREAM_CDN_HOST") ?? undefined;

    const form = await req.formData();
    const titleRaw = form.get("title");
    const fileRaw = form.get("file");

    const title = typeof titleRaw === "string" ? titleRaw.trim() : "";
    if (!title) {
      return json(400, { error: "title is required" });
    }

    if (!(fileRaw instanceof File)) {
      return json(400, { error: "file is required" });
    }

    const createResponse = await fetch(`https://video.bunnycdn.com/library/${libraryId}/videos`, {
      method: "POST",
      headers: {
        AccessKey: accessKey,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title }),
    });

    if (!createResponse.ok) {
      const createBody = await createResponse.text();
      return json(502, { error: "Failed to create Bunny video", details: createBody });
    }

    const createData = await createResponse.json();
    const videoId = createData?.guid as string | undefined;
    if (!videoId) {
      return json(502, { error: "Bunny create response did not include guid" });
    }

    const uploadResponse = await fetch(`https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`, {
      method: "PUT",
      headers: {
        AccessKey: accessKey,
        Accept: "application/json",
        "Content-Type": fileRaw.type || "application/octet-stream",
      },
      body: await fileRaw.arrayBuffer(),
    });

    if (!uploadResponse.ok) {
      const uploadBody = await uploadResponse.text();
      return json(502, { error: "Failed to upload Bunny video binary", details: uploadBody, videoId });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const baseSlug = slugify(title);
    const slug = `${baseSlug}-${videoId.slice(0, 8)}`;

    const { data: inserted, error: insertError } = await supabase
      .from("videos")
      .insert({
        title,
        slug,
        bunny_video_id: videoId,
        status: "processing",
        playback_url: buildPlaybackUrl(cdnHost, videoId),
      })
      .select("id, title, slug, bunny_video_id, status")
      .single();

    if (insertError) {
      return json(500, { error: "Failed to insert video in Supabase", details: insertError.message, videoId });
    }

    return json(200, {
      videoId,
      dbId: inserted.id,
      slug: inserted.slug,
      status: inserted.status,
      message: "Upload accepted and processing started",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return json(500, { error: message });
  }
});
