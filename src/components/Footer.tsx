import mascot from "@/assets/baddies-mascot.png";

const primaryLinks = ["Videos", "Categories", "Tags"];
const secondaryLinks = ["Support", "Privacy Policy", "DMCA", "Legal",];

const Footer = () => {
  return (
    <footer className="border-t border-primary/15 mt-10">
      <div className="container py-10 text-center">
        <p className="max-w-2xl mx-auto text-muted-foreground text-base leading-relaxed">
          Premium curated videos and creators — discover the baddest collection,
          updated daily. For mature audiences only.
        </p>
      </div>

      <div className="container py-10 flex flex-col items-center gap-6 border-t border-primary/15">
        {/*<a href="/" className="flex items-center gap-2">
          <img
            src={mascot}
            alt="Baddies mascot"
            width={64}
            height={64}
            loading="lazy"
            className="h-14 w-14 drop-shadow-[0_0_18px_hsl(var(--primary)/0.55)]"
          />*/}
          <span className="text-3xl font-bold text-white text-glow"> WILD BADDIES</span>
        {/*</a>*/}

        <nav className="flex flex-wrap justify-center gap-6 text-white font-bold tracking-wider">
          {primaryLinks.map((l) => (
            <a key={l} href="#" className="hover:text-primary transition-colors">
              {l.toUpperCase()}
            </a>
          ))}
        </nav>

        <nav className="flex flex-wrap justify-center gap-6 text-muted-foreground font-bold tracking-wider text-sm">
          {secondaryLinks.map((l) => (
            <a key={l} href="#" className="hover:text-primary transition-colors">
              {l.toUpperCase()}
            </a>
          ))}
        </nav>

        <p className="text-muted-foreground text-sm">Adult Sites</p>

        <p className="text-muted-foreground text-xs">
          © {new Date().getFullYear()} Wild Baddies. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;