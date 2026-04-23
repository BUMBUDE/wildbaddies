import { Eye, Star } from "lucide-react";

interface VideoCardProps {
  slug?: string;
  title: string;
  duration?: string;
  durationSeconds?: number | null;
  views: string | number;
  rating: string | number;
  thumbnailUrl?: string | null;
}

const formatDuration = (durationSeconds?: number | null, duration?: string) => {
  if (typeof duration === "string" && duration.trim()) {
    return duration;
  }

  if (!durationSeconds || durationSeconds < 0) {
    return "0:00";
  }

  const mins = Math.floor(durationSeconds / 60);
  const secs = `${durationSeconds % 60}`.padStart(2, "0");
  return `${mins}:${secs}`;
};

const VideoCard = ({ slug, title, duration, durationSeconds, views, rating, thumbnailUrl }: VideoCardProps) => {
  const fallbackSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "video";
  const videoSlug = slug ?? fallbackSlug;
  return (
    <a href={`/video/${videoSlug}`} className="group flex flex-col gap-3">
      <div className="relative overflow-hidden rounded-lg bg-secondary aspect-video">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={`${title} thumbnail`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-black" />
        )}
        <div className="absolute inset-0 ring-1 ring-inset ring-white/5 rounded-lg pointer-events-none" />
        <div className="absolute top-2 right-2 rounded bg-black/75 px-2 py-0.5 text-xs font-bold text-white">
          {formatDuration(durationSeconds, duration)}
        </div>
        {/* <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-primary/30 to-transparent" /> */}
      </div>
      <div className="text-center">
        <h3 className="text-base font-bold text-white truncate">{title}</h3>
        <div className="mt-1 flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" /> {views}
          </span>
          <span className="inline-flex items-center gap-1">
            <Star className="h-3.5 w-3.5 text-primary" /> {rating}
          </span>
        </div>
      </div>
    </a>
  );
};

export default VideoCard;