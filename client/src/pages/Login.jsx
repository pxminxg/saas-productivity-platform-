import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiFetch, setToken, getToken } from "../api/http";
import Toast from "../components/Toast";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [toast, setToast] = useState(null);
  const clearToast = () => setToast(null);

  async function handleLogin(e) {
    e.preventDefault();

    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      setToken(data.token);
      setToast({
        type: "success",
        title: "Logged in",
        message: "Welcome back!",
      });
      navigate("/dashboard");
    } catch (err) {
      setToast({ type: "error", title: "Login failed", message: err.message });
    }
  }

  useEffect(() => {
    if (getToken()) navigate("/dashboard");
  }, [navigate]);

  return (
    <div
      className="container"
      style={{
        minHeight: "calc(100vh - 64px)",
        display: "grid",
        placeItems: "center",
      }}
    >
      <Toast toast={toast} clearToast={clearToast} />

      <div className="card" style={{ width: "100%", maxWidth: 520 }}>
        <div className="cardPad">
          <div className="row spread">
            <div>
              <h1 className="h1">Welcome back</h1>
              <p className="sub">Sign in to manage your tasks.</p>
            </div>
            <span className="badge">SaaS Productivity</span>
          </div>

          <form onSubmit={handleLogin} style={{ display: "grid", gap: 12 }}>
            <input
              className="input"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />

            <input
              className="input"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />

            <button className="btn btnPrimary" type="submit">
              Login
            </button>
          </form>

          <p className="sub" style={{ marginTop: 14 }}>
            New here? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
