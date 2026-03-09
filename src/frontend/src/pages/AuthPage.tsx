import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BookOpen,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useSaveProfile } from "../hooks/useQueries";

export default function AuthPage() {
  const [tab, setTab] = useState<"login" | "register">("login");

  // Login form
  const [loginMobile, setLoginMobile] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Register form
  const [regName, setRegName] = useState("");
  const [regMobile, setRegMobile] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPw, setRegConfirmPw] = useState("");
  const [showRegPw, setShowRegPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const [loading, setLoading] = useState(false);

  const { login, identity, isLoggingIn } = useInternetIdentity();
  const { actor } = useActor();
  const saveProfile = useSaveProfile();

  const handleLogin = async () => {
    if (!loginMobile.trim()) {
      toast.error("Please enter your mobile number");
      return;
    }
    if (!loginPassword) {
      toast.error("Please enter your password");
      return;
    }
    setLoading(true);
    try {
      // Trigger Internet Identity login
      login();
    } catch {
      toast.error("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!regName.trim()) {
      toast.error("Please enter your full name");
      return;
    }
    if (!regMobile.trim() || !/^\d{10}$/.test(regMobile.trim())) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }
    if (!regEmail.trim() || !/\S+@\S+\.\S+/.test(regEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (regPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (regPassword !== regConfirmPw) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      // Trigger II login which also sets up profile
      login();
      // Profile will be saved via actor after identity is available
      if (actor) {
        await actor.saveCallerUserProfile({
          name: regName,
          email: regEmail,
          mobile: regMobile,
        });
      }
    } catch {
      toast.error("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // After identity is available, save profile for registration
  const handleSaveProfileAfterRegister = async () => {
    if (!actor || !identity) return;
    try {
      await saveProfile.mutateAsync({
        name: regName,
        email: regEmail,
        mobile: regMobile,
      });
    } catch {
      // Profile may already exist, non-critical
    }
  };

  // When identity becomes available from registration flow
  if (identity && regName && tab === "register") {
    handleSaveProfileAfterRegister();
  }

  const isWorking = loading || isLoggingIn;

  return (
    <div
      className="app-shell min-h-screen"
      style={{ backgroundColor: "oklch(0.97 0.005 60)" }}
    >
      {/* Header */}
      <div className="bg-brand-gradient px-6 pt-12 pb-10 text-white relative overflow-hidden">
        {/* Decorative circles */}
        <div
          className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-20"
          style={{ backgroundColor: "white" }}
        />
        <div
          className="absolute -bottom-4 -left-8 w-24 h-24 rounded-full opacity-10"
          style={{ backgroundColor: "white" }}
        />

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 flex flex-col items-center gap-3"
        >
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <BookOpen className="w-9 h-9 text-white" />
          </div>
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold tracking-wide">
              Fastep Career Library
            </h1>
            <p className="text-sm font-body text-white/70 mt-0.5 tracking-widest uppercase">
              Library Management
            </p>
          </div>
        </motion.div>
      </div>

      {/* Tab switcher */}
      <div className="px-4 -mt-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex rounded-2xl overflow-hidden shadow-brand bg-white"
        >
          <button
            type="button"
            data-ocid="auth.login.tab"
            onClick={() => setTab("login")}
            className={`flex-1 py-3.5 text-sm font-display font-semibold transition-all ${
              tab === "login"
                ? "bg-brand-gradient text-white"
                : "bg-white text-foreground/60"
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            data-ocid="auth.register.tab"
            onClick={() => setTab("register")}
            className={`flex-1 py-3.5 text-sm font-display font-semibold transition-all ${
              tab === "register"
                ? "bg-brand-gradient text-white"
                : "bg-white text-foreground/60"
            }`}
          >
            Register
          </button>
        </motion.div>
      </div>

      {/* Form area */}
      <div className="px-4 pt-6 pb-8">
        {tab === "login" ? (
          <motion.div
            key="login"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col gap-4"
          >
            <h2 className="font-display text-xl font-bold text-foreground">
              Welcome Back!
            </h2>
            <p className="text-sm text-muted-foreground -mt-2 font-body">
              Sign in to access your library account
            </p>

            {/* Mobile input */}
            <div className="space-y-1.5">
              <Label
                htmlFor="login-mobile"
                className="font-body text-sm font-medium"
              >
                Mobile Number
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  data-ocid="auth.login.input"
                  id="login-mobile"
                  type="tel"
                  placeholder="Enter mobile number"
                  value={loginMobile}
                  onChange={(e) => setLoginMobile(e.target.value)}
                  className="pl-10 h-12 font-body input-brand rounded-xl"
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
              </div>
            </div>

            {/* Password input */}
            <div className="space-y-1.5">
              <Label
                htmlFor="login-password"
                className="font-body text-sm font-medium"
              >
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  data-ocid="auth.login.password.input"
                  id="login-password"
                  type={showLoginPw ? "text" : "password"}
                  placeholder="Enter password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="pl-10 pr-10 h-12 font-body input-brand rounded-xl"
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPw(!showLoginPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showLoginPw ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember me + forgot */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  data-ocid="auth.remember.checkbox"
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(v) => setRememberMe(!!v)}
                />
                <label
                  htmlFor="remember"
                  className="text-sm font-body text-muted-foreground cursor-pointer"
                >
                  Remember Me
                </label>
              </div>
              <button
                type="button"
                className="text-sm font-body text-brand font-medium hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            {/* Login button */}
            <Button
              data-ocid="auth.login.submit_button"
              onClick={handleLogin}
              disabled={isWorking}
              className="h-12 btn-brand rounded-xl text-sm font-display font-semibold border-0 mt-2"
            >
              {isWorking ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {isWorking ? "Signing In..." : "Login Now"}
            </Button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground font-body">
                OR
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Register link */}
            <p className="text-center text-sm font-body text-muted-foreground">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => setTab("register")}
                className="text-brand font-semibold hover:underline"
              >
                Register now
              </button>
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="register"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col gap-4"
          >
            <h2 className="font-display text-xl font-bold text-foreground">
              Create Account
            </h2>
            <p className="text-sm text-muted-foreground -mt-2 font-body">
              Join Fastep Career Library today
            </p>

            {/* Full Name */}
            <div className="space-y-1.5">
              <Label
                htmlFor="reg-name"
                className="font-body text-sm font-medium"
              >
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  data-ocid="auth.register.name.input"
                  id="reg-name"
                  placeholder="Enter full name"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="pl-10 h-12 font-body input-brand rounded-xl"
                />
              </div>
            </div>

            {/* Mobile No */}
            <div className="space-y-1.5">
              <Label
                htmlFor="reg-mobile"
                className="font-body text-sm font-medium"
              >
                Mobile No.
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  data-ocid="auth.register.mobile.input"
                  id="reg-mobile"
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={regMobile}
                  onChange={(e) => setRegMobile(e.target.value)}
                  className="pl-10 h-12 font-body input-brand rounded-xl"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label
                htmlFor="reg-email"
                className="font-body text-sm font-medium"
              >
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  data-ocid="auth.register.email.input"
                  id="reg-email"
                  type="email"
                  placeholder="Enter email address"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="pl-10 h-12 font-body input-brand rounded-xl"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label
                htmlFor="reg-password"
                className="font-body text-sm font-medium"
              >
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  data-ocid="auth.register.password.input"
                  id="reg-password"
                  type={showRegPw ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="pl-10 pr-10 h-12 font-body input-brand rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setShowRegPw(!showRegPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showRegPw ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <Label
                htmlFor="reg-confirm"
                className="font-body text-sm font-medium"
              >
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  data-ocid="auth.register.confirm.input"
                  id="reg-confirm"
                  type={showConfirmPw ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={regConfirmPw}
                  onChange={(e) => setRegConfirmPw(e.target.value)}
                  className="pl-10 pr-10 h-12 font-body input-brand rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPw(!showConfirmPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showConfirmPw ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Register button */}
            <Button
              data-ocid="auth.register.submit_button"
              onClick={handleRegister}
              disabled={isWorking}
              className="h-12 btn-brand rounded-xl text-sm font-display font-semibold border-0 mt-2"
            >
              {isWorking ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {isWorking ? "Registering..." : "Register"}
            </Button>

            <p className="text-center text-sm font-body text-muted-foreground">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setTab("login")}
                className="text-brand font-semibold hover:underline"
              >
                Sign in
              </button>
            </p>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-auto pb-6 px-4 text-center">
        <p className="text-xs text-muted-foreground font-body">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
