const categories = ["Big Ass", "Strippers", "Black Baddies"];
const tags = ["Thot Baddies"];

const VideoMeta = () => {
  return (
    <div className="mt-8 space-y-6">
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Categories</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <span key={c} className="chip">{c}</span>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Tags</h3>
        <div className="flex flex-wrap gap-2">
          {tags.map((t) => (
            <span key={t} className="chip">{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideoMeta;