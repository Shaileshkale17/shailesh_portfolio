import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-bg px-4">
      <form onSubmit={handleSubmit} className="card w-full max-w-sm">
        <h1 className="mb-1 font-heading text-xl font-bold">Admin sign in</h1>
        <p className="mb-6 text-sm text-text-secondary">Manage your portfolio content.</p>

        <label className="mb-1 block text-sm text-text-secondary" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          className="input mb-4"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
        />

        <label className="mb-1 block text-sm text-text-secondary" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          className="input mb-4"
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
        />

        {error && <p className="mb-4 text-sm text-error">{error}</p>}

        <button type="submit" disabled={busy} className="btn-primary w-full">
          {busy ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
};

export default Login;
