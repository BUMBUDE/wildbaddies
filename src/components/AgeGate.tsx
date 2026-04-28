import { useEffect, useState } from "react";

const STORAGE_KEY = "age_verified";

const AgeGate = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) !== "1") setOpen(true);
    } catch {
      setOpen(true);
    }
  }, []);

  if (!open) return null;

  const enter = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
    setOpen(false);
  };

  const exit = () => {
    window.location.href = "https://www.google.com";
  };

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-background/95 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-xl rounded-lg border border-border bg-card shadow-2xl p-6 sm:p-10 text-center">
        <div className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          BADDIES
          <span className="ml-2 inline-block rounded bg-primary px-2 py-0.5 text-primary-foreground text-base align-middle">
            XXX
          </span>
        </div>

        <h1 className="mt-6 text-2xl sm:text-4xl font-bold uppercase text-foreground">
          This is an adult website
        </h1>

        <button
          type="button"
          className="mt-6 inline-flex rounded-md border border-border px-5 py-2 text-sm font-semibold text-foreground hover:border-primary hover:text-primary transition-colors"
        >
          Notice to Users
        </button>

        <p className="mt-6 text-sm sm:text-base text-muted-foreground leading-relaxed">
          This website contains age-restricted materials including nudity and explicit
          depictions of sexual activity. By entering, you affirm that you are at least 18
          years of age or the age of majority in the jurisdiction you are accessing the
          website from and you consent to viewing sexually explicit content.
        </p>

        <p className="mt-3 text-sm font-semibold text-primary">Notice to Law Enforcement</p>

        <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={enter}
            className="rounded-md bg-gradient-purple px-5 py-3 text-sm sm:text-base font-bold text-primary-foreground transition"
          >
            I am 18 or older — Enter
          </button>
          <button
            type="button"
            onClick={exit}
            className="rounded-md border border-border px-5 py-3 text-sm sm:text-base font-bold text-foreground hover:border-primary hover:text-primary transition-colors"
          >
            I am under 18 — Exit
          </button>
        </div>

        <p className="mt-6 text-xs sm:text-sm text-muted-foreground">
          Our <span className="text-primary">parental controls page</span> explains how you
          can easily block access to this site.
        </p>
        <p className="mt-2 text-xs sm:text-sm font-semibold text-primary">Terms of Service</p>

        <p className="mt-6 text-xs text-muted-foreground">© Baddies, {new Date().getFullYear()}</p>
      </div>
    </div>
  );
};

export default AgeGate;