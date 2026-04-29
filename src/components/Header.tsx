import { useState } from "react";
import { Search, Menu, X, User, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import mascot from "@/assets/baddies-mascot.png";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import AuthModal, { type AuthMode } from "@/components/auth/AuthModal";

const navItems: { label: string; href: string }[] = [
  { label: "Videos", href: "/" },
  { label: "Categories", href: "/categories" },
  { label: "Tags", href: "#" },
  { label: "Porn Directory", href: "#" },
];

const Header = () => {
  const [open, setOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [accountOpen, setAccountOpen] = useState(false);

  const openAuth = (mode: AuthMode) => {
    setAuthMode(mode);
    setAccountOpen(false);
    setAuthOpen(true);
  };

  return (
    <header className="relative z-30 bg-gradient-header border-b border-primary/20">
      <div className="container flex items-center justify-between gap-4 py-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          {/*<img
            src={mascot}
            alt="Baddies mascot logo"
            width={56}
            height={56}
            className="h-12 w-12 sm:h-14 sm:w-14 drop-shadow-[0_0_15px_hsl(var(--primary)/0.6)]"
          /> */}
          <span className="text-2xl sm:text-3xl font-bold tracking-wide text-white">
            WILD BADDIES
          </span>
        </Link>

        {/* Search (desktop) */}
        <div className="hidden md:flex flex-1 max-w-md items-center gap-2 text-muted-foreground">
          <Search className="h-5 w-5" />
          <input
            type="search"
            placeholder="SEARCH"
            className="w-full bg-transparent border-none outline-none text-base font-bold tracking-wider placeholder:text-muted-foreground"
          />
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <Popover open={accountOpen} onOpenChange={setAccountOpen}>
            <PopoverTrigger asChild>
              <button
                aria-label="Account"
                className="h-10 w-10 rounded-full bg-gradient-purple grid place-items-center transition-shadow hover:opacity-95"
              >
                <User className="h-5 w-5 text-white" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              sideOffset={8}
              className="w-44 p-2 bg-card border-border"
            >
              <button
                type="button"
                onClick={() => openAuth("login")}
                className="w-full text-left px-3 py-2 rounded-md text-sm font-extrabold tracking-widest uppercase text-white hover:bg-secondary transition-colors"
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => openAuth("signup")}
                className="w-full text-left px-3 py-2 rounded-md text-sm font-extrabold tracking-widest uppercase text-white hover:bg-secondary transition-colors"
              >
                Sign Up
              </button>
            </PopoverContent>
          </Popover>
          <button
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="h-10 w-10 grid place-items-center text-white hover:text-primary transition-colors"
          >
            {open ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
          </button>
        </div>
      </div>

      {/* Mobile search */}
      <div className="container md:hidden pb-3 flex items-center gap-2 text-muted-foreground">
        <Search className="h-5 w-5" />
        <input
          type="search"
          placeholder="SEARCH"
          className="w-full bg-transparent border-none outline-none text-base font-bold tracking-wider placeholder:text-muted-foreground"
        />
      </div>

      {/* Slide-down menu */}
      {open && (
        <nav className="border-t border-primary/20 bg-gradient-header animate-in fade-in slide-in-from-top-2 duration-200">
          <ul className="container py-6 flex flex-col items-center gap-5 text-white font-bold tracking-wider">
            {navItems.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.href}
                  onClick={() => setOpen(false)}
                  className="hover:text-primary transition-colors"
                >
                  {item.label.toUpperCase()}
                </Link>
              </li>
            ))}
            <li>
              <Link
                to="/upload"
                onClick={() => setOpen(false)}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-purple px-8 py-3 uppercase tracking-widest text-white  hover:opacity-95 transition-opacity"
              >
                Upload
                <Upload className="h-4 w-4" />
              </Link>
            </li>
          </ul>
        </nav>
      )}

      <AuthModal
        open={authOpen}
        mode={authMode}
        onOpenChange={setAuthOpen}
        onSwitchMode={setAuthMode}
      />
    </header>
  );
};

export default Header;
