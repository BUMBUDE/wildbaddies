import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import VideoCard from "@/components/VideoCard";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown } from "lucide-react";
import { getVideosByCategory, type VideoSort, type CategoryVideosResult } from "@/lib/videos";
import { formatCount } from "@/lib/format";

const SORTS: Array<{ id: VideoSort; label: string }> = [
  { id: "recent", label: "MOST RECENT" },
  { id: "viewed", label: "MOST VIEWED" },
  { id: "rated", label: "BEST RATED" },
];

const CategoryVideosPage = () => {
  const { slug = "" } = useParams<{ slug: string }>();
  const [sort, setSort] = useState<VideoSort>("recent");
  const [data, setData] = useState<CategoryVideosResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getVideosByCategory(slug, sort)
      .then((res) => {
        if (cancelled) return;
        setData(res);
        document.title = `${res.category?.name ?? slug} | Baddies`;
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug, sort]);

  const name = data?.category?.name ?? slug.replace(/-/g, " ");
  const videos = data?.videos ?? [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <section className="container py-10 sm:py-16">
          <h1 className="text-center text-4xl sm:text-6xl font-bold uppercase text-foreground text-glow tracking-tight">
            {name} Videos
          </h1>

          {/* Sort row */}
          <div className="mt-6 flex flex-col sm:flex-row items-center sm:justify-between gap-4">
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm font-bold tracking-wide">
              {SORTS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSort(s.id)}
                  className={`uppercase transition-colors ${
                    sort === s.id
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-1 text-sm font-bold uppercase text-primary"
            >
              All Time <ChevronDown className="h-4 w-4" />
            </button>
          </div>

          {/* Grid 3-2-1 */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {loading &&
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-3">
                  <Skeleton className="aspect-video w-full rounded-lg" />
                  <Skeleton className="h-4 w-2/3 mx-auto" />
                  <Skeleton className="h-3 w-1/2 mx-auto" />
                </div>
              ))}

            {!loading &&
              !error &&
              videos.map((v) => (
                <VideoCard
                  key={v.id}
                  slug={v.slug}
                  title={v.title}
                  durationSeconds={v.duration_seconds}
                  views={formatCount(v.views)}
                  rating={v.rating}
                  thumbnailUrl={v.thumbnail_url}
                />
              ))}
          </div>

          {error && (
            <p className="mt-10 text-center text-sm text-destructive">{error}</p>
          )}

          {!loading && !error && videos.length === 0 && (
            <p className="mt-10 text-center text-muted-foreground">
              No videos in this category yet.
            </p>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default CategoryVideosPage;