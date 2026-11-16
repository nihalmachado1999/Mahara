import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

function IconBookmark() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M6 3.5h12a1 1 0 0 1 1 1V21l-7-4-7 4V4.5a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}
function IconMapPin() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
function IconCalendar() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="3.5" y="5" width="17" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3.5 9.5h17M8 3v3.5M16 3v3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function IconEye() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
function IconEyeOff() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M3 3l18 18M9.9 5.2A10.6 10.6 0 0 1 12 5c6.5 0 10 7 10 7a17.7 17.7 0 0 1-3.2 4.1M6.5 6.7A17.6 17.6 0 0 0 2 12s3.5 7 10 7a10 10 0 0 0 3.4-.6M9.5 9.6a3 3 0 0 0 4.2 4.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconGoogle() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.63h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.87c2.27-2.09 3.58-5.17 3.58-8.81Z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.92l-3.87-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.1A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.27 14.27a7.2 7.2 0 0 1 0-4.54v-3.1H1.27a12 12 0 0 0 0 10.74l4-3.1Z" />
      <path fill="#EA4335" d="M12 4.75c1.76 0 3.35.6 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.27 6.63l4 3.1C6.22 6.87 8.87 4.75 12 4.75Z" />
    </svg>
  );
}
function IconX() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function IconSpinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="auth-spinner">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="40 100" />
    </svg>
  );
}

const BENEFITS = [
  { Icon: IconBookmark, text: "Save your favorite places and restaurants" },
  { Icon: IconMapPin, text: "Revisit AI-built itineraries anytime" },
  { Icon: IconCalendar, text: "Get personalized picks based on your interests" },
];

function FieldLabel({ children }) {
  return (
    <label
      className="font-grotesk block mb-1.5"
      style={{ fontSize: "0.62rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#4A4038" }}
    >
      {children}
    </label>
  );
}

function TextField({ label, ...props }) {
  return (
    <div className="mb-4">
      <FieldLabel>{label}</FieldLabel>
      <input
        {...props}
        className="font-dm w-full px-4 py-3.5 rounded-[8px] border transition-colors"
        style={{ background: "#F2E9DB", borderColor: "rgba(26,20,16,0.1)", color: "#1A1410", fontSize: "0.9rem", outline: "none" }}
        onFocus={(e) => (e.target.style.borderColor = "#9B1B30")}
        onBlur={(e) => (e.target.style.borderColor = "rgba(26,20,16,0.1)")}
      />
    </div>
  );
}

function PasswordField({ label, value, onChange, show, onToggleShow, helperText }) {
  return (
    <div className="mb-4">
      <FieldLabel>{label}</FieldLabel>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          required
          className="font-dm w-full px-4 py-3.5 rounded-[8px] border transition-colors"
          style={{ background: "#F2E9DB", borderColor: "rgba(26,20,16,0.1)", color: "#1A1410", fontSize: "0.9rem", outline: "none", paddingRight: "2.75rem" }}
          onFocus={(e) => (e.target.style.borderColor = "#9B1B30")}
          onBlur={(e) => (e.target.style.borderColor = "rgba(26,20,16,0.1)")}
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="absolute right-3 top-1/2 -translate-y-1/2"
          style={{ color: "#4A4038" }}
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <IconEyeOff /> : <IconEye />}
        </button>
      </div>
      {helperText && (
        <p className="font-dm mt-1.5" style={{ fontSize: "0.72rem", color: "#4A4038" }}>
          {helperText}
        </p>
      )}
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login"); // login | signup | reset | update-password
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setMode("update-password");
      } else if (event === "SIGNED_IN" && session) {
        navigate("/profile");
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

useEffect(() => {
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) navigate("/profile");
  });
}, [navigate]);

  function resetMessages() {
    setError("");
    setSuccessMessage("");
  }

  function switchMode(next) {
    resetMessages();
    setPassword("");
    setConfirmPassword("");
    setMode(next);
  }

  async function handleLogin(e) {
    e.preventDefault();
    resetMessages();
    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signInError) setError(signInError.message);
  }

  async function handleSignup(e) {
    e.preventDefault();
    resetMessages();
    if (!agreedToTerms) {
      setError("Please agree to the Terms of Service and Privacy Policy.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    setLoading(false);
    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    if (data?.user && !data?.session) {
      setSuccessMessage(`We've sent a confirmation link to ${email}.`);
    }
  }

  async function handleGoogleSignIn() {
    resetMessages();
    setLoading(true);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/profile` },
    });
    if (oauthError) {
      setLoading(false);
      setError(oauthError.message);
    }
  }

  async function handlePasswordReset(e) {
    e.preventDefault();
    resetMessages();
    setLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    setLoading(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setSuccessMessage(`If an account exists for ${email}, a reset link is on its way.`);
  }

  async function handleUpdatePassword(e) {
    e.preventDefault();
    resetMessages();
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setSuccessMessage("Password updated — redirecting...");
    setTimeout(() => navigate("/profile"), 1200);
  }

  const showTabs = mode === "login" || mode === "signup";

  return (
    <div className="flex flex-col md:flex-row" style={{ minHeight: "100vh" }}>
      <style>{`
        .auth-spinner { animation: auth-spin 0.8s linear infinite; }
        @keyframes auth-spin { to { transform: rotate(360deg); } }
        .auth-checkbox { width: 18px; height: 18px; border-radius: 6px; accent-color: #9B1B30; cursor: pointer; }
      `}</style>

      <div
        className="w-full md:w-3/5 flex flex-col justify-center px-8 md:px-16 py-10 md:py-0"
        style={{ background: "#1A1410" }}
      >
        <h1 className="font-cormorant italic text-3xl md:text-5xl mb-4" style={{ color: "#FAF6EF" }}>
          Your Bahrain, remembered.
        </h1>
        <p className="font-dm mb-8" style={{ color: "rgba(250,246,239,0.6)", fontSize: "0.95rem", maxWidth: "420px" }}>
          Save places, build itineraries, and pick up your trip right where you left off.
        </p>

        <div className="hidden md:flex flex-col gap-4 mb-10">
          {BENEFITS.map(({ Icon, text }, i) => (
            <div key={i} className="flex items-center gap-3">
              <span style={{ color: "#B8924A" }}>
                <Icon />
              </span>
              <span className="font-grotesk" style={{ color: "rgba(250,246,239,0.75)", fontSize: "0.8rem", letterSpacing: "0.02em", textTransform: "none" }}>
                {text}
              </span>
            </div>
          ))}
        </div>

        <div className="hidden md:block sadu-strip" style={{ maxWidth: "240px" }}></div>
      </div>

      <div className="w-full md:w-2/5 flex flex-col justify-center px-6 sm:px-10 py-10 md:py-0" style={{ background: "#FAF6EF" }}>
        <div style={{ maxWidth: "380px", width: "100%", margin: "0 auto" }}>
          <a href="/" className="font-cormorant italic text-xl mb-8 inline-block" style={{ color: "#1A1410" }}>
            Bah<span style={{ color: "#9B1B30" }}>rain</span>
          </a>

          {showTabs && (
            <div className="flex gap-6 mb-8" style={{ borderBottom: "1px solid rgba(26,20,16,0.1)" }}>
              {["login", "signup"].map((tabMode) => (
                <button
                  key={tabMode}
                  type="button"
                  onClick={() => switchMode(tabMode)}
                  className="font-grotesk pb-3"
                  style={{
                    fontSize: "0.72rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: mode === tabMode ? "#9B1B30" : "#4A4038",
                    borderBottom: mode === tabMode ? "2px solid #9B1B30" : "2px solid transparent",
                    marginBottom: "-1px",
                  }}
                >
                  {tabMode === "login" ? "Log In" : "Sign Up"}
                </button>
              ))}
            </div>
          )}

          {(mode === "reset" || mode === "update-password") && (
            <div className="mb-6">
              <h2 className="font-jakarta font-bold text-xl mb-1" style={{ color: "#1A1410" }}>
                {mode === "reset" ? "Reset your password" : "Choose a new password"}
              </h2>
              {mode === "reset" && (
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="font-dm"
                  style={{ fontSize: "0.82rem", color: "#9B1B30" }}
                >
                  ← Back to login
                </button>
              )}
            </div>
          )}

          {error && (
            <div
              className="flex items-start justify-between gap-2 mb-5 px-4 py-3 rounded-[8px]"
              style={{ background: "#F4DCDF", color: "#6E1322" }}
            >
              <span className="font-dm" style={{ fontSize: "0.82rem" }}>{error}</span>
              <button type="button" onClick={() => setError("")} style={{ color: "#6E1322", flexShrink: 0 }}>
                <IconX />
              </button>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 px-4 py-3 rounded-[8px]" style={{ background: "#F2E9DB", color: "#1A1410" }}>
              <span className="font-dm" style={{ fontSize: "0.82rem" }}>{successMessage}</span>
            </div>
          )}

          {mode === "login" && !successMessage && (
            <form onSubmit={handleLogin}>
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <PasswordField
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                show={showPassword}
                onToggleShow={() => setShowPassword((s) => !s)}
              />
              <div className="text-right mb-5" style={{ marginTop: "-0.5rem" }}>
                <button
                  type="button"
                  onClick={() => switchMode("reset")}
                  className="font-dm"
                  style={{ fontSize: "0.8rem", color: "#9B1B30" }}
                >
                  Forgot password?
                </button>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="font-grotesk w-full py-3.5 rounded-full flex items-center justify-center gap-2"
                style={{
                  background: "#9B1B30",
                  color: "#FAF6EF",
                  fontSize: "0.78rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading && <IconSpinner />}
                {loading ? "Logging in..." : "Log In"}
              </button>

              <div className="flex items-center gap-3 my-6">
                <div style={{ flex: 1, height: 1, background: "rgba(26,20,16,0.12)" }} />
                <span className="font-grotesk" style={{ fontSize: "0.68rem", color: "#4A4038" }}>OR</span>
                <div style={{ flex: 1, height: 1, background: "rgba(26,20,16,0.12)" }} />
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="font-dm w-full py-3 rounded-[8px] border flex items-center justify-center gap-2.5"
                style={{ background: "#FFFFFF", borderColor: "rgba(26,20,16,0.1)", color: "#1A1410", fontSize: "0.88rem" }}
              >
                <IconGoogle />
                Continue with Google
              </button>

              <p className="font-dm text-center mt-6" style={{ fontSize: "0.85rem", color: "#4A4038" }}>
                Don't have an account?{" "}
                <button type="button" onClick={() => switchMode("signup")} style={{ color: "#9B1B30" }}>
                  Sign up
                </button>
              </p>
            </form>
          )}

          {mode === "signup" && !successMessage && (
            <form onSubmit={handleSignup}>
              <TextField
                label="Full Name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <PasswordField
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                show={showPassword}
                onToggleShow={() => setShowPassword((s) => !s)}
                helperText="At least 8 characters"
              />
              <PasswordField
                label="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                show={showConfirmPassword}
                onToggleShow={() => setShowConfirmPassword((s) => !s)}
              />
              <label className="flex items-start gap-2.5 mb-5" style={{ cursor: "pointer" }}>
                <input
                  type="checkbox"
                  className="auth-checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  style={{ marginTop: "2px" }}
                />
                <span className="font-dm" style={{ fontSize: "0.8rem", color: "#4A4038" }}>
                  I agree to the Terms of Service and Privacy Policy
                </span>
              </label>
              <button
                type="submit"
                disabled={loading}
                className="font-grotesk w-full py-3.5 rounded-full flex items-center justify-center gap-2"
                style={{
                  background: "#9B1B30",
                  color: "#FAF6EF",
                  fontSize: "0.78rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading && <IconSpinner />}
                {loading ? "Creating account..." : "Create Account"}
              </button>

              <div className="flex items-center gap-3 my-6">
                <div style={{ flex: 1, height: 1, background: "rgba(26,20,16,0.12)" }} />
                <span className="font-grotesk" style={{ fontSize: "0.68rem", color: "#4A4038" }}>OR</span>
                <div style={{ flex: 1, height: 1, background: "rgba(26,20,16,0.12)" }} />
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="font-dm w-full py-3 rounded-[8px] border flex items-center justify-center gap-2.5"
                style={{ background: "#FFFFFF", borderColor: "rgba(26,20,16,0.1)", color: "#1A1410", fontSize: "0.88rem" }}
              >
                <IconGoogle />
                Continue with Google
              </button>

              <p className="font-dm text-center mt-6" style={{ fontSize: "0.85rem", color: "#4A4038" }}>
                Already have an account?{" "}
                <button type="button" onClick={() => switchMode("login")} style={{ color: "#9B1B30" }}>
                  Log in
                </button>
              </p>
            </form>
          )}

          {mode === "reset" && !successMessage && (
            <form onSubmit={handlePasswordReset}>
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="font-grotesk w-full py-3.5 rounded-full flex items-center justify-center gap-2"
                style={{
                  background: "#9B1B30",
                  color: "#FAF6EF",
                  fontSize: "0.78rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading && <IconSpinner />}
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          )}

          {mode === "update-password" && !successMessage && (
            <form onSubmit={handleUpdatePassword}>
              <PasswordField
                label="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                show={showPassword}
                onToggleShow={() => setShowPassword((s) => !s)}
                helperText="At least 8 characters"
              />
              <PasswordField
                label="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                show={showConfirmPassword}
                onToggleShow={() => setShowConfirmPassword((s) => !s)}
              />
              <button
                type="submit"
                disabled={loading}
                className="font-grotesk w-full py-3.5 rounded-full flex items-center justify-center gap-2"
                style={{
                  background: "#9B1B30",
                  color: "#FAF6EF",
                  fontSize: "0.78rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading && <IconSpinner />}
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}