import { Folder, Eye, Star } from "lucide-react";
import { formatCount, formatRating } from "@/lib/format";
import type { CategoryRecord } from "@/lib/categories";

interface CategoryCardProps {
  category: CategoryRecord;
}

const CategoryCard = ({ category }: CategoryCardProps) => {
  const { name, slug, thumbnail_url, video_count, total_views, rating } = category;
  return (
    <a href={`/categories/${slug}`} className="group flex flex-col gap-2">
      <div className="relative overflow-hidden rounded-md bg-secondary aspect-square">
        {thumbnail_url ? (
          <img
            src={thumbnail_url}
            alt={`${name} category thumbnail`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-black" />
        )}
        <div className="absolute inset-0 ring-1 ring-inset ring-white/5 rounded-md pointer-events-none" />
      </div>
      <div className="text-center">
        <h3 className="text-sm font-bold uppercase text-white tracking-wide group-hover:text-primary transition-colors">
          {name}
        </h3>
        <div className="mt-1 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {video_count !== null && (
            <span className="inline-flex items-center gap-1">
              <Folder className="h-3 w-3" /> {formatCount(video_count)}
            </span>
          )}
          {total_views !== null && (
            <span className="inline-flex items-center gap-1">
              <Eye className="h-3 w-3" /> {formatCount(total_views)}
            </span>
          )}
          {rating !== null && (
            <span className="inline-flex items-center gap-1">
              <Star className="h-3 w-3 text-primary" /> {formatRating(rating)}
            </span>
          )}
        </div>
      </div>
    </a>
  );
};

export default CategoryCard;