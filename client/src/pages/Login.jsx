import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiFetch, setToken, getToken } from "../api/http";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [isError, setIsError] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setIsError(false);
    setMsg("Logging in...");

    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      setToken(data.token);
      setMsg("Logged in!");
      navigate("/dashboard");
    } catch (err) {
      setIsError(true);
      setMsg(err.message);
    }
  }

  if (getToken()) navigate("/dashboard");

  return (
    <div
      className="container"
      style={{
        minHeight: "calc(100vh - 64px)",
        display: "grid",
        placeItems: "center",
      }}
    >
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

          <p className={`msg ${msg ? (isError ? "msgErr" : "msgOk") : ""}`}>
            {msg}
          </p>

          <p className="sub" style={{ marginTop: 14 }}>
            New here? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
