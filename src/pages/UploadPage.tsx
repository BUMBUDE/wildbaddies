import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Upload as UploadIcon } from "lucide-react";

const UploadPage = () => {
  const [source, setSource] = useState<"file" | "url">("file");
  const [fileName, setFileName] = useState<string>("");
  const [url, setUrl] = useState("");

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <main className="container py-10 lg:py-14 flex-1">
        <div className="flex items-center gap-3 mb-8">
          <UploadIcon className="h-7 w-7 text-primary" />
          <h1 className="text-3xl sm:text-4xl font-bold tracking-wide uppercase text-glow">
            Upload Video
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Form */}
          <section className="lg:col-span-2 space-y-8">
            {/* Local file */}
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="source"
                  checked={source === "file"}
                  onChange={() => setSource("file")}
                  className="h-5 w-5 accent-primary"
                />
                <span className="font-bold tracking-wider uppercase">
                  Upload <span className="text-primary">file</span> from your local disk
                </span>
              </label>

              <div
                className={`flex items-center gap-3 rounded-md border border-primary/40 bg-secondary/30 p-2 ${
                  source === "file" ? "" : "opacity-50 pointer-events-none"
                }`}
              >
                <label className="cursor-pointer rounded-full bg-gradient-purple px-5 py-2 text-sm font-bold uppercase tracking-wider text-white btn-glow-soft hover:btn-glow transition-shadow">
                  Choose file
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) =>
                      setFileName(e.target.files?.[0]?.name ?? "")
                    }
                  />
                </label>
                <span className="text-muted-foreground truncate">
                  {fileName || "No file chosen"}
                </span>
              </div>
            </div>

            {/* URL */}
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="source"
                  checked={source === "url"}
                  onChange={() => setSource("url")}
                  className="h-5 w-5 accent-primary"
                />
                <span className="font-bold tracking-wider uppercase">
                  Upload <span className="text-primary">file</span> from internet URL
                </span>
              </label>

              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="specify video file URL here"
                disabled={source !== "url"}
                className="w-full rounded-md border border-primary/40 bg-secondary/30 px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
              />
            </div>

            {/* Continue */}
            <button
              type="button"
              className="w-full sm:w-80 rounded-full bg-gradient-purple py-3.5 font-bold uppercase tracking-widest text-white btn-glow hover:opacity-95 transition-opacity"
            >
              Continue
            </button>

            <p className="text-sm text-muted-foreground">
              <a href="#" className="text-primary hover:underline">
                Click here
              </a>{" "}
              for more detailed content guidelines
            </p>
          </section>

          {/* Rules */}
          <aside className="space-y-4">
            <h2 className="text-xl font-bold tracking-wider uppercase">
              Upload Rules
            </h2>
            <p className="text-foreground/90">
              Before uploading, please make sure that your content meets the
              following conditions:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/90">
              <li>Contains sex, masturbation, or nudity</li>
              <li>Is at least one minute long</li>
              <li>Is not attributed to the wrong model</li>
              <li>Is not already featured on the website</li>
            </ul>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UploadPage;