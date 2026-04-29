import { useState } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export type AuthMode = "login" | "signup";

interface AuthModalProps {
  open: boolean;
  mode: AuthMode;
  onOpenChange: (open: boolean) => void;
  onSwitchMode: (mode: AuthMode) => void;
}

const labelCls = "block text-xs font-extrabold tracking-widest text-white uppercase mb-2";
const inputCls =
  "w-full rounded-md bg-secondary/60 border border-border px-4 py-3 text-sm text-white placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary/60 transition";

const PasswordField = ({ id, placeholder, value, onChange }: {
  id: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputCls + " pr-11"}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/80 hover:text-primary transition-colors"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
};

const SubmitButton = ({ children, loading }: { children: React.ReactNode; loading?: boolean }) => (
  <button
    type="submit"
    disabled={loading}
    className="w-full rounded-full bg-gradient-purple px-8 py-3.5 text-sm font-extrabold tracking-widest uppercase text-white shadow-[var(--shadow-glow-soft)] hover:opacity-95 transition-opacity disabled:opacity-60"
  >
    {loading ? "Please wait…" : children}
  </button>
);

const LoginForm = ({ onSwitch, onDone }: { onSwitch: () => void; onDone: () => void }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email.trim(), password);
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <h2 className="text-2xl font-extrabold tracking-wider text-white uppercase">Login</h2>

      {error && (
        <p className="rounded-md bg-destructive/20 border border-destructive/40 px-4 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div>
        <label htmlFor="login-email" className={labelCls}>Email<span className="text-primary">*</span></label>
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={inputCls}
        />
      </div>

      <div>
        <label htmlFor="login-password" className={labelCls}>Password<span className="text-primary">*</span></label>
        <PasswordField id="login-password" placeholder="" value={password} onChange={setPassword} />
      </div>

      <SubmitButton loading={loading}>Log In</SubmitButton>

      <p className="text-center text-xs font-extrabold tracking-widest uppercase text-white">
        Not a member yet?{" "}
        <button type="button" onClick={onSwitch} className="text-primary hover:opacity-90">
          Sign up now for free!
        </button>
      </p>
    </form>
  );
};

const SignupForm = ({ onSwitch, onDone }: { onSwitch: () => void; onDone: () => void }) => {
  const { signup } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await signup(email.trim(), password, username.trim() || undefined);
      setSuccess(true);
      setTimeout(onDone, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-4 text-center">
        <h2 className="text-2xl font-extrabold tracking-wider text-white uppercase">Check your email</h2>
        <p className="text-muted-foreground text-sm">
          We sent a confirmation link to <span className="text-white">{email}</span>. Click it to activate your account.
        </p>
      </div>
    );
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <h2 className="text-2xl font-extrabold tracking-wider text-white uppercase">Sign Up</h2>

      {error && (
        <p className="rounded-md bg-destructive/20 border border-destructive/40 px-4 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div>
        <label htmlFor="signup-username" className={labelCls}>Username</label>
        <input id="signup-username" type="text" placeholder="Your username" value={username} onChange={(e) => setUsername(e.target.value)} className={inputCls} />
      </div>

      <div>
        <label htmlFor="signup-email" className={labelCls}>Email<span className="text-primary">*</span></label>
        <input id="signup-email" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputCls} />
      </div>

      <div>
        <label htmlFor="signup-password" className={labelCls}>Password<span className="text-primary">*</span></label>
        <PasswordField id="signup-password" placeholder="Min. 6 characters" value={password} onChange={setPassword} />
      </div>

      <div>
        <label htmlFor="signup-confirm" className={labelCls}>Confirm Password<span className="text-primary">*</span></label>
        <PasswordField id="signup-confirm" placeholder="Re-type your password" value={confirm} onChange={setConfirm} />
      </div>

      <p className="text-center text-xs text-muted-foreground">
        By signing up, you agree to our{" "}
        <Link to="/terms-of-service" className="text-primary hover:opacity-90">Terms and Conditions</Link>
      </p>

      <SubmitButton loading={loading}>Sign Up</SubmitButton>

      <p className="text-center text-xs font-extrabold tracking-widest uppercase text-white">
        Already a member?{" "}
        <button type="button" onClick={onSwitch} className="text-primary hover:opacity-90">Sign In</button>
      </p>
    </form>
  );
};

const AuthModal = ({ open, mode, onOpenChange, onSwitchMode }: AuthModalProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-md p-0 gap-0 bg-card border-border overflow-hidden [&>button]:hidden">
      <button
        type="button"
        onClick={() => onOpenChange(false)}
        aria-label="Close"
        className="absolute right-4 top-4 z-10 text-muted-foreground hover:text-white transition-colors"
      >
        <X className="h-5 w-5" />
      </button>
      <div className="max-h-[85vh] overflow-y-auto p-6 sm:p-8">
        {mode === "login" ? (
          <LoginForm onSwitch={() => onSwitchMode("signup")} onDone={() => onOpenChange(false)} />
        ) : (
          <SignupForm onSwitch={() => onSwitchMode("login")} onDone={() => onOpenChange(false)} />
        )}
      </div>
    </DialogContent>
  </Dialog>
);

export default AuthModal;