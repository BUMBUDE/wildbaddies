import { useState } from "react";
import VideoCard from "./VideoCard";
import { useQuery } from "@tanstack/react-query";

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

const CATEGORY_CHIPS = [
  "All", "Amateur Baddies", "Black Baddies", "Sextapes", "Teen Baddies",
  "Big Tits", "Latina vs BBC", "Black on Black", "Blowjob", "Big Ass",
  "Latina Baddies", "BBW Baddies", "Strippers", "Interracial",
  "White on White", "White on Black", "Threesome", "Boy-Boy-Girl", "Boy-Girl-Girl",
];

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

  const { data, isLoading, isError, error, isFetching } = useQuery<ListVideosResponse>({
    queryKey: ["videos", "list", page, limit, sort],
    queryFn:  () => fetchVideos(page, limit, sort),
    placeholderData: (prev) => prev, // keep old data while fetching next page
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

  return (
    <section className="container py-10 sm:py-16">
      <h2 className="text-center text-4xl sm:text-6xl font-bold text-white text-glow tracking-tight">
        FEATURED VIDEOS
      </h2>

      {/* Category chips */}
      <div className="mt-8 flex flex-wrap justify-center gap-2 max-w-5xl mx-auto">
        {CATEGORY_CHIPS.map((c) => (
          <span key={c} className="chip">{c}</span>
        ))}
        <span className="chip border-primary text-primary">Show All Categories</span>
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
          <p className="text-muted-foreground col-span-full">Loading videos…</p>
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
                    ? "bg-gradient-purple text-white btn-glow"
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