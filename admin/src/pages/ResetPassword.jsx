import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../lib/api";
import { TOKEN_KEY, USER_KEY } from "../lib/api";

/**
 * Completes the password-reset flow using the `:token` from the emailed
 * reset link (see backend `POST /api/auth/reset-password/:token`).
 * On success the backend also returns a fresh JWT, so this signs the user
 * straight in rather than bouncing them back to the login form.
 */
const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setBusy(true);
    try {
      const { data } = await api.post(`/auth/reset-password/${token}`, { password });
      // Sign the user in immediately with the fresh token the backend issued.
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data));
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "This reset link is invalid or has expired.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-bg px-4">
      <div className="glass-blob -top-32 -left-32 h-96 w-96 bg-primary" />
      <div className="glass-blob -bottom-32 -right-24 h-96 w-96 bg-accent" />

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="glass-card relative z-10 w-full max-w-sm rounded-2xl p-8"
      >
        <div className="mb-1 font-heading text-xl font-bold">Set a new password</div>
        <p className="mb-6 text-sm text-text-secondary">Choose a new password for your admin account.</p>

        <label className="mb-1 block text-sm text-text-secondary" htmlFor="password">
          New password
        </label>
        <input
          id="password"
          type="password"
          required
          autoComplete="new-password"
          className="input mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <label className="mb-1 block text-sm text-text-secondary" htmlFor="confirmPassword">
          Confirm password
        </label>
        <input
          id="confirmPassword"
          type="password"
          required
          autoComplete="new-password"
          className="input mb-4"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        {error && <p className="mb-4 text-sm text-error">{error}</p>}

        <button type="submit" disabled={busy} className="btn-primary w-full">
          {busy ? "Resetting..." : "Reset password"}
        </button>

        <Link to="/login" className="mt-4 block text-center text-sm text-primary-light hover:underline">
          &larr; Back to sign in
        </Link>
      </motion.form>
    </div>
  );
};

export default ResetPassword;
