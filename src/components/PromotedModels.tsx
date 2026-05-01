import { useRef } from "react";
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import model from "@/assets/model-placeholder.jpg";

const models = [
  { name: "Suki 😊 #1 THIN BIG BOOB ASIAN" },
  { name: "Mia" },
  { name: "Haley" },
  { name: "Suki 😊 #1 THIN BIG BOOB ASIAN" },
  { name: "Kacy" },
  { name: "Luna" },
  { name: "Aria" },
];

const PromotedModels = () => {
  const scroller = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    const el = scroller.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <section className="container py-10 sm:py-16">
      <h2 className="text-center text-3xl sm:text-4xl font-bold text-white  tracking-tight">
        PROMOTED MODELS
      </h2>

      <div className="relative mt-8">
        <button
          onClick={() => scroll("left")}
          aria-label="Previous"
          className="hidden md:grid absolute -left-2 top-1/2 -translate-y-1/2 h-12 w-12 place-items-center rounded-full border-2 border-primary text-primary bg-background/40 backdrop-blur hover:bg-primary hover:text-white transition z-10"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <div
          ref={scroller}
          className="flex gap-4 sm:gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 px-1
                     [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {models.map((m, i) => (
            <article
              key={i}
              className="snap-start shrink-0 w-[60%] sm:w-[40%] md:w-[28%] lg:w-[19%] flex flex-col gap-2"
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-secondary">
                <img
                  src={model}
                  alt={`${m.name} portrait`}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
              <button className="inline-flex items-center justify-center gap-1.5 rounded-md bg-gradient-purple py-2 text-sm font-bold text-white transition">
                <ArrowUpRight className="h-4 w-4" /> VIEW ONLYFANS
              </button>
              <p className="text-center text-sm font-bold text-white truncate px-1">
                {m.name}
              </p>
            </article>
          ))}
        </div>

        <button
          onClick={() => scroll("right")}
          aria-label="Next"
          className="hidden md:grid absolute -right-2 top-1/2 -translate-y-1/2 h-12 w-12 place-items-center rounded-full border-2 border-primary text-primary bg-background/40 backdrop-blur hover:bg-primary hover:text-white transition z-10"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>
    </section>
  );
};

export default PromotedModels;