import { Eye, Star } from "lucide-react";
import { Link } from "react-router-dom";
import poster from "@/assets/video-placeholder.jpg";

interface VideoCardProps {
  title: string;
  duration: string;
  views: string;
  rating: string;
}

const VideoCard = ({ title, duration, views, rating }: VideoCardProps) => {
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "video";
  return (
    <Link to={`/video/${slug}`} className="group flex flex-col gap-3">
      <div className="relative overflow-hidden rounded-lg bg-secondary aspect-video">
        <img
          src={poster}
          alt={`${title} thumbnail`}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 ring-1 ring-inset ring-white/5 rounded-lg pointer-events-none" />
        <div className="absolute top-2 right-2 rounded bg-black/75 px-2 py-0.5 text-xs font-bold text-white">
          {duration}
        </div>
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-primary/30 to-transparent" />
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
    </Link>
  );
};

export default VideoCard;