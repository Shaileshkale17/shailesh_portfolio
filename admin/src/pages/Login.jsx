import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, LockKeyhole } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(form.email, form.password, remember);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-bg px-4">
      {/* Ambient animated gradient orbs — purely decorative background for the glassmorphism card. */}
      <motion.div
        className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/30 blur-3xl"
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-accent/20 blur-3xl"
        animate={{ x: [0, -30, 0], y: [0, -40, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative w-full max-w-sm rounded-2xl border border-border/80 bg-surface/60 p-8 shadow-2xl backdrop-blur-xl"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent text-white shadow-lg">
            <LockKeyhole size={22} />
          </div>
          <h1 className="font-heading text-xl font-bold">Admin sign in</h1>
          <p className="mt-1 text-sm text-text-secondary">Manage your portfolio &amp; dashboard.</p>
        </div>

        <label className="mb-1 block text-sm text-text-secondary" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          className="input mb-4"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
        />

        <label className="mb-1 block text-sm text-text-secondary" htmlFor="password">
          Password
        </label>
        <div className="relative mb-1">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            className="input pr-10"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text"
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-text-secondary">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 rounded border-border bg-surface-raised accent-primary"
            />
            Remember me
          </label>
          <button
            type="button"
            onClick={() => setShowForgot((s) => !s)}
            className="text-sm text-primary hover:underline"
          >
            Forgot password?
          </button>
        </div>

        {showForgot && (
          <p className="mb-4 rounded-lg border border-border bg-surface-raised p-3 text-xs text-text-secondary">
            Self-service password reset isn't set up yet — for now, reset your admin password directly via the
            backend (update the user's password hash, or re-run the seed script).
          </p>
        )}

        {error && <p className="mb-4 text-sm text-error">{error}</p>}

        <button type="submit" disabled={busy} className="btn-primary w-full gap-2">
          {busy && <Loader2 size={16} className="animate-spin" />}
          {busy ? "Signing in..." : "Sign in"}
        </button>
      </motion.form>
    </div>
  );
};

export default Login;
