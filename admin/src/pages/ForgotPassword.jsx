import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../lib/api";

/**
 * Requests a password-reset email. Always shows the same success message
 * regardless of whether the email exists (matches the backend's
 * intentionally generic response — see authService.forgotPassword) so
 * this screen can't be used to check which emails have admin accounts.
 */
const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-bg px-4">
      <div className="glass-blob -top-32 -left-32 h-96 w-96 bg-primary" />
      <div className="glass-blob -bottom-32 -right-24 h-96 w-96 bg-accent" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="glass-card relative z-10 w-full max-w-sm rounded-2xl p-8"
      >
        <div className="mb-1 font-heading text-xl font-bold">Forgot password</div>
        <p className="mb-6 text-sm text-text-secondary">We'll email you a link to reset it.</p>

        <AnimatePresence mode="wait">
          {sent ? (
            <motion.div key="sent" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm">
              <p className="mb-4 text-success">
                If <span className="font-medium text-text">{email}</span> is registered, a reset link is on its way.
                Check your inbox (and spam folder).
              </p>
              <Link to="/login" className="text-primary-light hover:underline">
                &larr; Back to sign in
              </Link>
            </motion.div>
          ) : (
            <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleSubmit}>
              <label className="mb-1 block text-sm text-text-secondary" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                className="input mb-4"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              {error && <p className="mb-4 text-sm text-error">{error}</p>}

              <button type="submit" disabled={busy} className="btn-primary w-full">
                {busy ? "Sending..." : "Send reset link"}
              </button>

              <Link to="/login" className="mt-4 block text-center text-sm text-primary-light hover:underline">
                &larr; Back to sign in
              </Link>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
