import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { RefreshCw } from "lucide-react";

const VideoComments = () => {
  const [comment, setComment] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const captcha = "8K3Q";

  return (
    <section className="mt-12 border-t border-border pt-8">
      <h2 className="text-2xl sm:text-3xl font-bold text-white uppercase mb-6">Comments (0)</h2>

      <div className="space-y-4 max-w-3xl">
        <Textarea
          placeholder="Add a comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="min-h-[120px] bg-secondary/40 border-border focus-visible:ring-primary"
        />
        <Input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-secondary/40 border-border focus-visible:ring-primary"
        />
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center gap-2 rounded-md bg-secondary/40 border border-border px-4 py-2 select-none">
            <span className="font-mono text-lg font-bold text-primary tracking-[0.4em] line-through decoration-primary/40">
              {captcha}
            </span>
            <button aria-label="Refresh" className="text-muted-foreground hover:text-primary transition-colors">
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
          <Input
            placeholder="Security code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="bg-secondary/40 border-border focus-visible:ring-primary sm:max-w-xs"
          />
        </div>
        <button
          className="inline-flex items-center justify-center rounded-full bg-gradient-purple px-8 py-3 text-sm font-bold uppercase tracking-wider text-white btn-glow hover:opacity-90 transition-opacity"
        >
          Add Comment
        </button>
      </div>
    </section>
  );
};

export default VideoComments;