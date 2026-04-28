import Header from "@/components/Header";
import FeaturedVideos from "@/components/FeaturedVideos";
import PromotedModels from "@/components/PromotedModels";
import Footer from "@/components/Footer";
//import AdBanner from "@/components/AdBanner";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      {/*<AdBanner />*/}
      <main>
        <h1 className="sr-only">Baddies — Featured Videos and Promoted Models</h1>
        <FeaturedVideos />
        <PromotedModels />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
