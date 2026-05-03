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

export type VideoSort = "recent" | "viewed" | "rated";

// ─── Search suggestions ────────────────────────────────────────────────────
export interface VideoSuggestion {
  id: string;
  title: string;
  slug: string;
  thumbnail_url: string | null;
}

/**
 * Lightweight autocomplete suggestions backed by the `list-videos` edge
 * function `q` parameter. Returns `[]` for empty queries or any failure.
 */
export const searchVideoSuggestions = async (
  query: string,
  limit = 6,
  signal?: AbortSignal,
): Promise<VideoSuggestion[]> => {
  const q = query.trim();
  if (!q) return [];

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  if (!supabaseUrl || !supabaseAnonKey) return [];

  const params = new URLSearchParams({
    q,
    limit: String(limit),
    status: "ready",
    page: "1",
    sort: "newest",
  });

  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/list-videos?${params}`, {
      signal,
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { videos?: Array<Record<string, unknown>> };
    return (data.videos ?? []).map((v) => ({
      id: String(v.id),
      title: String(v.title ?? ""),
      slug: String(v.slug ?? ""),
      thumbnail_url: (v.thumbnail_url as string | null) ?? null,
    }));
  } catch {
    return [];
  }
};

const sortToOrder = (sort: VideoSort): { col: string; ascending: boolean } => {
  switch (sort) {
    case "viewed":
      return { col: "views", ascending: false };
    case "rated":
      return { col: "rating", ascending: false };
    default:
      return { col: "created_at", ascending: false };
  }
};

export interface CategoryVideosResult {
  category: { id: string; name: string; slug: string } | null;
  videos: VideoRecord[];
}

/**
 * Fetches videos for a category. Tries the `get-videos-by-category` edge function
 * first; if unavailable, falls back to a direct join query.
 */
export const getVideosByCategory = async (
  slug: string,
  sort: VideoSort = "recent",
): Promise<CategoryVideosResult> => {
  const client = ensureSupabase();

  // 1) Preferred path: edge function
  try {
    const { data, error } = await client.functions.invoke("get-videos-by-category", {
      body: { slug, sort },
    });
    if (!error && data) {
      const payload = data as {
        category?: { id: string; name: string; slug: string } | null;
        videos?: VideoRecord[];
      };
      if (Array.isArray(payload.videos)) {
        return {
          category: payload.category ?? null,
          videos: payload.videos,
        };
      }
    }
  } catch {
    // fall through to fallback
  }

  // 2) Fallback: direct query
  const { data: cat, error: catErr } = await client
    .from("categories")
    .select("id,name,slug")
    .eq("slug", slug)
    .maybeSingle();
  if (catErr) throw new Error(catErr.message);
  if (!cat) return { category: null, videos: [] };

  const order = sortToOrder(sort);
  const { data: rows, error: vErr } = await client
    .from("video_categories")
    .select(
      "videos:video_id ( id,title,slug,bunny_video_id,status,playback_url,thumbnail_url,duration_seconds,views,rating,created_at )",
    )
    .eq("category_id", cat.id);
  if (vErr) throw new Error(vErr.message);

  const videos = ((rows ?? []) as Array<{ videos: VideoRecord | VideoRecord[] | null }>)
    .flatMap((r) => {
      const v = r.videos;
      if (!v) return [];
      return Array.isArray(v) ? v : [v];
    })
    .filter((v): v is VideoRecord => Boolean(v?.id) && v.status === "ready")
    .sort((a, b) => {
      const av = (a as unknown as Record<string, unknown>)[order.col];
      const bv = (b as unknown as Record<string, unknown>)[order.col];
      if (typeof av === "number" && typeof bv === "number") return bv - av;
      return String(bv ?? "").localeCompare(String(av ?? ""));
    });

  return {
    category: cat as { id: string; name: string; slug: string },
    videos,
  };
};
