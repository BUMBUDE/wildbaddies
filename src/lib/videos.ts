import { supabase } from "@/integrations/supabase/client";
import * as tus from "tus-js-client";

export type VideoStatus = "processing" | "ready" | "failed";

export interface VideoRecord {
  id: string;
  title: string;
  slug: string;
  bunny_video_id: string;
  status: VideoStatus;
  playback_url: string | null;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  views: number;
  rating: number;
  created_at: string;
}

const ensureSupabase = () => {
  if (!supabase) {
    throw new Error("Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }
  return supabase;
};

export const listVideos = async (status: VideoStatus = "ready"): Promise<VideoRecord[]> => {
  const client = ensureSupabase();
  const { data, error } = await client
    .from("videos")
    .select("id,title,slug,bunny_video_id,status,playback_url,thumbnail_url,duration_seconds,views,rating,created_at")
    .eq("status", status)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as VideoRecord[];
};

export const getVideoBySlug = async (slug: string): Promise<VideoRecord | null> => {
  const client = ensureSupabase();
  const { data, error } = await client
    .from("videos")
    .select("id,title,slug,bunny_video_id,status,playback_url,thumbnail_url,duration_seconds,views,rating,created_at")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as VideoRecord | null;
};

export interface UploadVideoOptions {
  title: string;
  file: File;
  categoryIds?: string[];
  onProgress?: (percentage: number) => void;
}

export interface UploadVideoResult {
  videoId: string;
  dbId: string;
  slug: string;
  status: VideoStatus;
  categoriesInserted: number;
}

/**
 * Direct-to-Bunny TUS upload flow:
 * 1. Call `get-upload-url` edge function — creates Bunny video + DB row, returns TUS credentials
 * 2. Upload file directly from client → Bunny TUS endpoint (never passes through Supabase)
 * 3. Bunny encodes; sync-video-status / webhook flips status to ready
 */
export const uploadVideo = async ({
  title,
  file,
  categoryIds = [],
  onProgress,
}: UploadVideoOptions): Promise<UploadVideoResult> => {
  const client = ensureSupabase();

  // Step 1: Get TUS credentials from edge function
  const { data, error } = await client.functions.invoke("get-upload-url", {
    body: { title, categoryIds },
  });

  if (error) throw new Error(error.message);

  const {
    videoId,
    dbId,
    slug,
    status,
    categoriesInserted,
    tusEndpoint,
    tusHeaders,
  } = data as {
    videoId: string;
    dbId: string;
    slug: string;
    status: VideoStatus;
    categoriesInserted: number;
    tusEndpoint: string;
    tusHeaders: Record<string, string>;
  };

  // Step 2: Upload directly to Bunny via TUS (no Supabase memory involved)
  await new Promise<void>((resolve, reject) => {
    const upload = new tus.Upload(file, {
      endpoint: tusEndpoint,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      headers: tusHeaders,
      metadata: {
        filename: file.name,
        filetype: file.type,
      },
      onProgress(bytesUploaded, bytesTotal) {
        const pct = Math.round((bytesUploaded / bytesTotal) * 100);
        onProgress?.(pct);
      },
      onSuccess() {
        resolve();
      },
      onError(err) {
        reject(new Error(`TUS upload failed: ${err.message}`));
      },
    });

    upload.start();
  });

  return { videoId, dbId, slug, status, categoriesInserted };
};

export const incrementVideoView = async (videoId: string): Promise<void> => {
  const client = ensureSupabase();
  try {
    await client.functions.invoke("increment-view", { body: { videoId } });
  } catch {
    // Best-effort; never break playback.
  }
};

export interface VideoCategory {
  id: string;
  name: string;
  slug: string;
}

export const listVideoCategories = async (videoId: string): Promise<VideoCategory[]> => {
  const client = ensureSupabase();
  const { data, error } = await client
    .from("video_categories")
    .select("categories:category_id ( id, name, slug )")
    .eq("video_id", videoId);

  if (error) throw new Error(error.message);

  return ((data ?? []) as Array<{ categories: VideoCategory | VideoCategory[] | null }>)
    .flatMap((row) => {
      const c = row.categories;
      if (!c) return [];
      return Array.isArray(c) ? c : [c];
    })
    .filter((c): c is VideoCategory => Boolean(c?.id && c?.name));
};
