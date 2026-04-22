import { supabase } from "@/integrations/supabase/client";

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

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as VideoRecord[];
};

export const getVideoBySlug = async (slug: string): Promise<VideoRecord | null> => {
  const client = ensureSupabase();
  const { data, error } = await client
    .from("videos")
    .select("id,title,slug,bunny_video_id,status,playback_url,thumbnail_url,duration_seconds,views,rating,created_at")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as VideoRecord | null;
};

export const uploadVideo = async (title: string, file: File) => {
  const client = ensureSupabase();
  const formData = new FormData();
  formData.set("title", title);
  formData.set("file", file);

  const { data, error } = await client.functions.invoke("create-video", {
    body: formData,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data as { videoId: string; dbId: string; slug: string; status: VideoStatus; message: string };
};
