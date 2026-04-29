import { useMemo } from "react";
import { Navigate, Link } from "react-router-dom";
import { ChevronDown, Info } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import mascot from "@/assets/baddies-mascot.png";

const formatJoined = (iso: string) => {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  if (days === 0) return "today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? "" : "s"} ago`;
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-baseline gap-1.5">
    <span className="text-sm text-muted-foreground">{label}:</span>
    <span className="text-sm font-semibold text-white">{value}</span>
  </div>
);

const ProfilePage = () => {
  const { user, isAuthenticated } = useAuth();

  const joined = useMemo(
    () => (user ? formatJoined(user.joinedAt) : ""),
    [user],
  );

  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="container py-10 sm:py-14">
          {/* Avatar */}
          <div className="flex flex-col items-center text-center">
            <div className="h-32 w-32 sm:h-40 sm:w-40 rounded-md overflow-hidden bg-secondary border border-border">
              <img
                src={user.avatarUrl || mascot}
                alt={`${user.username} avatar`}
                className="h-full w-full object-cover"
              />
            </div>

            <h1 className="mt-5 text-3xl sm:text-4xl font-extrabold tracking-wider uppercase text-white text-glow">
              {user.username}
            </h1>

            <div className="mt-2 flex items-center gap-3 text-sm">
              <span className="font-extrabold tracking-wider uppercase text-white">
                #{user.rank ?? "—"} <span className="text-muted-foreground">Rank</span>
              </span>
              <span className="text-muted-foreground">
                <span className="font-extrabold text-white">{user.points ?? 0}</span> Points
              </span>
              <button
                type="button"
                aria-label="About points"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Info className="h-4 w-4" />
              </button>
            </div>

            <button
              type="button"
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-primary/60 px-6 py-1.5 text-xs font-extrabold tracking-widest uppercase text-primary hover:bg-primary/10 transition-colors"
            >
              Edit
              <ChevronDown className="h-3.5 w-3.5" />
            </button>

            {/* Meta row */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              <InfoRow label="Joined" value={joined} />
              <InfoRow label="Country" value={user.country || "no info"} />
              <InfoRow label="Gender" value={user.gender || "no info"} />
              <InfoRow
                label="Relationship status"
                value={user.relationship || "no info"}
              />
              <InfoRow
                label="Sexual orientation"
                value={user.orientation || "no info"}
              />
            </div>
          </div>

          {/* Messages section */}
          <div className="mt-12">
            <div className="flex items-center justify-center gap-2">
              <h2 className="text-sm font-extrabold tracking-[0.25em] uppercase text-white">
                Messages
              </h2>
              <span className="text-sm text-muted-foreground">0</span>
            </div>
            <div className="mt-4 h-px w-full bg-border" />

            <div className="py-16 text-center text-sm text-muted-foreground">
              You have no messages yet.{" "}
              <Link to="/" className="text-primary hover:opacity-90">
                Discover videos
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ProfilePage;