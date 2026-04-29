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

const PasswordField = ({
  id,
  placeholder,
}: {
  id: string;
  placeholder: string;
}) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? "text" : "password"}
        placeholder={placeholder}
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

const SubmitButton = ({ children }: { children: React.ReactNode }) => (
  <button
    type="submit"
    className="w-full rounded-full bg-gradient-purple px-8 py-3.5 text-sm font-extrabold tracking-widest uppercase text-white shadow-[var(--shadow-glow-soft)] hover:opacity-95 transition-opacity"
  >
    {children}
  </button>
);

const LoginForm = ({
  onSwitch,
  onDone,
}: {
  onSwitch: () => void;
  onDone: () => void;
}) => {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  return (
  <form
    className="space-y-5"
    onSubmit={(e) => {
      e.preventDefault();
      if (!username.trim()) return;
      login(username.trim());
      onDone();
    }}
  >
    <h2 className="text-2xl font-extrabold tracking-wider text-white uppercase">
      Login
    </h2>

    <div>
      <label htmlFor="login-username" className={labelCls}>
        Username<span className="text-primary">*</span>
      </label>
      <input
        id="login-username"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className={inputCls}
      />
    </div>

    <div>
      <label htmlFor="login-password" className={labelCls}>
        Password<span className="text-primary">*</span>
      </label>
      <PasswordField id="login-password" placeholder="" />
      <div className="mt-2 text-xs text-muted-foreground">
        <a href="#" className="hover:text-primary transition-colors">
          Forgot password?
        </a>{" "}
        <span className="px-1">·</span>
        <a href="#" className="hover:text-primary transition-colors">
          Missing confirmation email?
        </a>
      </div>
    </div>

    <label className="flex items-center gap-2 text-sm text-white/90 select-none">
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-border bg-secondary accent-[hsl(var(--primary))]"
      />
      Remember me
    </label>

    <SubmitButton>Log In</SubmitButton>

    <p className="text-center text-xs font-extrabold tracking-widest uppercase text-white">
      Not a member yet?{" "}
      <button
        type="button"
        onClick={onSwitch}
        className="text-primary hover:opacity-90"
      >
        Sign up now for free!
      </button>
    </p>
  </form>
  );
};

const SignupForm = ({
  onSwitch,
  onDone,
}: {
  onSwitch: () => void;
  onDone: () => void;
}) => {
  const { signup } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  return (
  <form
    className="space-y-5"
    onSubmit={(e) => {
      e.preventDefault();
      if (!username.trim()) return;
      signup(username.trim(), email.trim() || undefined);
      onDone();
    }}
  >
    <h2 className="text-2xl font-extrabold tracking-wider text-white uppercase">
      Sign Up
    </h2>

    <div>
      <label htmlFor="signup-username" className={labelCls}>
        Username
      </label>
      <input
        id="signup-username"
        type="text"
        placeholder="Enter your desired username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className={inputCls}
      />
    </div>

    <div>
      <label htmlFor="signup-email" className={labelCls}>
        Email
      </label>
      <input
        id="signup-email"
        type="email"
        placeholder="Enter your email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={inputCls}
      />
    </div>

    <div>
      <label htmlFor="signup-password" className={labelCls}>
        Password
      </label>
      <PasswordField id="signup-password" placeholder="Enter 6 characters or more" />
    </div>

    <div>
      <label htmlFor="signup-password-confirm" className={labelCls}>
        Password Confirmation
      </label>
      <PasswordField
        id="signup-password-confirm"
        placeholder="Re-type your password"
      />
    </div>

    <p className="text-center text-xs text-muted-foreground">
      By signing up, you agree to our{" "}
      <Link to="/terms-of-service" className="text-primary hover:opacity-90">
        Terms and Conditions
      </Link>
    </p>

    <SubmitButton>Sign Up</SubmitButton>

    <p className="text-center text-xs font-extrabold tracking-widest uppercase text-white">
      Already a member?{" "}
      <button
        type="button"
        onClick={onSwitch}
        className="text-primary hover:opacity-90"
      >
        Sign In
      </button>
    </p>

    <div className="pt-3 border-t border-border text-center">
      <a
        href="#"
        className="text-sm text-primary hover:opacity-90 transition-opacity"
      >
        Resend confirmation email
      </a>
    </div>
  </form>
  );
};

const AuthModal = ({ open, mode, onOpenChange, onSwitchMode }: AuthModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md p-0 gap-0 bg-card border-border overflow-hidden [&>button]:hidden"
      >
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
            <LoginForm
              onSwitch={() => onSwitchMode("signup")}
              onDone={() => onOpenChange(false)}
            />
          ) : (
            <SignupForm
              onSwitch={() => onSwitchMode("login")}
              onDone={() => onOpenChange(false)}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;