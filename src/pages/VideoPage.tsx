import { useParams } from "react-router-dom";
import { Eye, Star } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PromotedModels from "@/components/PromotedModels";
import VideoPlayer from "@/components/video/VideoPlayer";
import VideoActions from "@/components/video/VideoActions";
import VideoMeta from "@/components/video/VideoMeta";
import VideoComments from "@/components/video/VideoComments";
import SimilarVideos from "@/components/video/SimilarVideos";

const VideoPage = () => {
  const { slug } = useParams();
  const title = (slug || "backshots-for-thicky").replace(/-/g, " ");

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
              <Eye className="h-4 w-4" /> 1.2K views
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Star className="h-4 w-4 text-primary fill-primary" /> 5
            </span>
            <span>1 year ago</span>
          </div>
        </section>

        <section className="container">
          <VideoPlayer />
          <VideoActions />
          <VideoMeta />
          <VideoComments />
        </section>

        <SimilarVideos />
        <PromotedModels />
      </main>
      <Footer />
    </div>
  );
};

export default VideoPage;