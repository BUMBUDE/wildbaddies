import VideoCard from "@/components/VideoCard";

const similar = [
  { title: "Backshots Pt 2", duration: "3:42", views: "1.2K", rating: "5" },
  { title: "Late Night", duration: "4:18", views: "892", rating: "5" },
  { title: "Studio Session", duration: "2:55", views: "640", rating: "5" },
  { title: "VIP Room", duration: "6:21", views: "2.1K", rating: "5" },
  { title: "After Hours", duration: "1:47", views: "455", rating: "5" },
  { title: "Private Show", duration: "5:09", views: "1.8K", rating: "5" },
  { title: "Hotel Tape", duration: "3:33", views: "720", rating: "5" },
  { title: "Penthouse", duration: "8:02", views: "3.4K", rating: "5" },
  { title: "Backstage", duration: "2:11", views: "510", rating: "5" },
];

const SimilarVideos = () => {
  return (
    <section className="container py-10 sm:py-16">
      <h2 className="text-center text-3xl sm:text-5xl font-bold text-white text-glow tracking-tight uppercase">
        Similar Videos
      </h2>
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {similar.map((v, i) => (
          <VideoCard key={i} {...v} />
        ))}
      </div>
    </section>
  );
};

export default SimilarVideos;