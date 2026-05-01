import { useMemo, useState } from "react";
import VideoCard from "./VideoCard";
import VideoCardSkeleton from "./VideoCardSkeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { listCategories, type CategoryRecord } from "@/lib/categories";
import { getVideosByCategory } from "@/lib/videos";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Video {
  id: string;
  title: string;
  slug: string;
  thumbnail_url: string | null;
  duration_seconds: number;
  views: number;
  rating: number;
  status: string;
  created_at: string;
}

interface Pagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface ListVideosResponse {
  videos: Video[];
  pagination: Pagination;
}

// ─── API ──────────────────────────────────────────────────────────────────────
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

async function fetchVideos(
  page: number,
  limit: number,
  sort: string
): Promise<ListVideosResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    sort,
    status: "ready",
  });
  const res = await fetch(
    `${SUPABASE_URL}/functions/v1/list-videos?${params}`,
    { headers: { apikey: SUPABASE_ANON_KEY, "Content-Type": "application/json" } }
  );
  if (!res.ok) throw new Error(`Failed to fetch videos: ${res.statusText}`);
  return res.json();
}

// ─── Constants ────────────────────────────────────────────────────────────────
const SHOW_OPTIONS = [30, 60, 90, 120];
const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "views",  label: "Most Viewed" },
  { value: "rating", label: "Top Rated" },
];

const COLLAPSED_CHIPS_COUNT = 8;

const sortToCategorySort = (s: string): "recent" | "viewed" | "rated" => {
  if (s === "views") return "viewed";
  if (s === "rating") return "rated";
  return "recent";
};

// ─── Pagination UI ────────────────────────────────────────────────────────────
function getPageWindow(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "…")[] = [1];

  if (current > 3) pages.push("…");

  const start = Math.max(2, current - 1);
  const end   = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push("…");
  pages.push(total);

  return pages;
}

// ─── Component ────────────────────────────────────────────────────────────────
const FeaturedVideos = () => {
  const [page,  setPage]  = useState(1);
  const [limit, setLimit] = useState(30);
  const [sort,  setSort]  = useState("newest");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expanded, setExpanded] = useState(false);

  // ── Categories
  const { data: categories, isLoading: catsLoading } = useQuery<CategoryRecord[]>({
    queryKey: ["categories", "list"],
    queryFn: listCategories,
    staleTime: 5 * 60 * 1000,
  });

  // ── Videos (All vs by-category)
  const isAll = selectedCategory === "all";

  const { data, isLoading, isError, error, isFetching } = useQuery<ListVideosResponse>({
    queryKey: ["videos", "list", selectedCategory, page, limit, sort],
    queryFn: async () => {
      if (isAll) return fetchVideos(page, limit, sort);
      const res = await getVideosByCategory(selectedCategory, sortToCategorySort(sort));
      const all = res.videos.map((v) => ({
        id: v.id,
        title: v.title,
        slug: v.slug,
        thumbnail_url: v.thumbnail_url,
        duration_seconds: v.duration_seconds ?? 0,
        views: v.views,
        rating: v.rating,
        status: v.status,
        created_at: v.created_at,
      })) as Video[];
      const totalCount = all.length;
      const totalPages = Math.max(1, Math.ceil(totalCount / limit));
      const start = (page - 1) * limit;
      const slice = all.slice(start, start + limit);
      return {
        videos: slice,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    },
    placeholderData: (prev) => prev,
  });

  const videos     = data?.videos     ?? [];
  const pagination = data?.pagination ?? null;
  const totalPages = pagination?.totalPages ?? 1;
  const pageWindow = getPageWindow(page, totalPages);

  const goTo = (p: number) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLimitChange = (n: number) => {
    setLimit(n);
    setPage(1);
  };

  const handleSortChange = (s: string) => {
    setSort(s);
    setPage(1);
  };

  const handleCategoryChange = (slug: string) => {
    setSelectedCategory(slug);
    setPage(1);
  };

  // Build chip list: synthetic "All" + DB categories
  const allChips = useMemo(() => {
    const dbChips = (categories ?? []).map((c) => ({ slug: c.slug, name: c.name }));
    return [{ slug: "all", name: "All" }, ...dbChips];
  }, [categories]);

  const visibleChips = expanded ? allChips : allChips.slice(0, COLLAPSED_CHIPS_COUNT);
  const canExpand = allChips.length > COLLAPSED_CHIPS_COUNT;

  return (
    <section className="container py-10 sm:py-16">
      <h2 className="text-center text-4xl sm:text-6xl font-bold text-white tracking-tight">
        FEATURED VIDEOS
      </h2>

      {/* Category chips */}
      <div className="mt-8 flex flex-wrap justify-center gap-2 max-w-5xl mx-auto">
        {catsLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-24 rounded-full" />
            ))
          : visibleChips.map((c) => {
              const active = selectedCategory === c.slug;
              return (
                <button
                  key={c.slug}
                  type="button"
                  onClick={() => handleCategoryChange(c.slug)}
                  className={
                    active
                      ? "chip bg-primary text-white border-primary"
                      : "chip"
                  }
                >
                  {c.name}
                </button>
              );
            })}
        {!catsLoading && canExpand && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="chip border-primary text-primary"
          >
            {expanded ? "Hide Categories" : "Show All Categories"}
          </button>
        )}
      </div>

      {/* Controls row */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
        {/* Show: 30 60 90 120 */}
        <div className="flex items-center gap-3">
          <span>Show:</span>
          {SHOW_OPTIONS.map((n) => (
            <button
              key={n}
              onClick={() => handleLimitChange(n)}
              className={`font-bold transition-colors ${
                limit === n ? "text-primary" : "hover:text-primary"
              }`}
            >
              {n}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-3">
          <span>Sort:</span>
          {SORT_OPTIONS.map((o) => (
            <button
              key={o.value}
              onClick={() => handleSortChange(o.value)}
              className={`font-bold transition-colors ${
                sort === o.value ? "text-primary" : "hover:text-primary"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>

        {/* Total count */}
        {pagination && (
          <div className="text-white font-bold">
            {pagination.totalCount.toLocaleString()} videos
          </div>
        )}
      </div>

      {/* Grid */}
      <div
        className={`mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 transition-opacity duration-200 ${
          isFetching ? "opacity-50" : "opacity-100"
        }`}
      >
        {isLoading && (
          <>
            {Array.from({ length: Math.min(limit, 12) }).map((_, i) => (
              <VideoCardSkeleton key={i} />
            ))}
          </>
        )}
        {isError && (
          <p className="text-destructive col-span-full">
            Could not load videos: {(error as Error).message}
          </p>
        )}
        {!isLoading && !isError && videos.length === 0 && (
          <p className="text-muted-foreground col-span-full">No videos found.</p>
        )}
        {videos.map((video) => (
          <VideoCard
            key={video.id}
            slug={video.slug}
            title={video.title}
            durationSeconds={video.duration_seconds}
            views={video.views}
            rating={video.rating}
            thumbnailUrl={video.thumbnail_url}
          />
        ))}
      </div>

      {/* Pagination row */}
      {pagination && totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          {/* Prev */}
          <button
            onClick={() => goTo(page - 1)}
            disabled={!pagination.hasPrevPage}
            aria-label="Previous page"
            className="h-9 w-9 rounded-full grid place-items-center text-white hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            ‹
          </button>

          {/* Page numbers */}
          {pageWindow.map((p, i) =>
            p === "…" ? (
              <span key={`ellipsis-${i}`} className="text-muted-foreground px-1">
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => goTo(p as number)}
                className={`h-9 w-9 rounded-full grid place-items-center font-bold transition ${
                  p === page
                    ? "bg-gradient-purple text-white"
                    : "text-white hover:text-primary"
                }`}
              >
                {p}
              </button>
            )
          )}

          {/* Next */}
          <button
            onClick={() => goTo(page + 1)}
            disabled={!pagination.hasNextPage}
            aria-label="Next page"
            className="h-9 w-9 rounded-full grid place-items-center text-white hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            ›
          </button>
        </div>
      )}

      {/* Page info */}
      {pagination && totalPages > 1 && (
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Page {page} of {totalPages.toLocaleString()}
        </p>
      )}
    </section>
  );
};

export default FeaturedVideos;