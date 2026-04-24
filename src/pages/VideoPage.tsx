import { useParams } from "react-router-dom";
import { Eye, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PromotedModels from "@/components/PromotedModels";
import VideoPlayer from "@/components/video/VideoPlayer";
import VideoActions from "@/components/video/VideoActions";
import VideoMeta from "@/components/video/VideoMeta";
import VideoComments from "@/components/video/VideoComments";
import SimilarVideos from "@/components/video/SimilarVideos";
import { getVideoBySlug, listVideos, incrementVideoView } from "@/lib/videos";

const VideoPage = () => {
  const { slug } = useParams();
  const { data: video, isLoading, isError, error } = useQuery({
    queryKey: ["video", slug],
    queryFn: () => getVideoBySlug(slug ?? ""),
    enabled: Boolean(slug),
  });
  const { data: similarVideos = [] } = useQuery({
    queryKey: ["videos", "similar", video?.id],
    queryFn: () => listVideos("ready"),
    enabled: Boolean(video?.id),
  });

  const title = video?.title ?? (slug || "video").replace(/-/g, " ");
  const related = similarVideos.filter((item) => item.slug !== video?.slug).slice(0, 6);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <section className="container pt-6 sm:pt-10 pb-4">
          <h1 className="text-3xl sm:text-5xl font-bold text-white uppercase text-glow tracking-tight">
            {title}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Eye className="h-4 w-4" /> {video?.views ?? 0} views
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Star className="h-4 w-4 text-primary fill-primary" /> {video?.rating ?? 0}
            </span>
            <span>{video ? new Date(video.created_at).toLocaleDateString() : "Pending"}</span>
          </div>
        </section>

        <section className="container">
          {isLoading && <p className="text-muted-foreground">Loading video...</p>}
          {isError && <p className="text-destructive">Failed to load video: {(error as Error).message}</p>}
          {!isLoading && !isError && !video && (
            <p className="text-muted-foreground">Video not found or still processing.</p>
          )}
          <VideoPlayer
            videoUrl={video?.playback_url}
            posterUrl={video?.thumbnail_url}
            onFirstPlay={video?.id ? () => incrementVideoView(video.id) : undefined}
          />
          <VideoActions />
          <VideoMeta />
          <VideoComments />
        </section>

        <SimilarVideos videos={related} />
        <PromotedModels />
      </main>
      <Footer />
    </div>
  );
};

export default VideoPage;