import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiFetch, setToken } from "../api/http";

export default function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [isError, setIsError] = useState(false);

  async function handleRegister(e) {
    e.preventDefault();
    setIsError(false);
    setMsg("Creating account...");

    try {
      await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      const loginData = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      setToken(loginData.token);
      setMsg("Account created!");
      navigate("/dashboard");
    } catch (err) {
      setIsError(true);
      setMsg(err.message);
    }
  }

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
              <h1 className="h1">Create your account</h1>
              <p className="sub">Start tracking tasks in seconds.</p>
            </div>
            <span className="badge">Free</span>
          </div>

          <form onSubmit={handleRegister} style={{ display: "grid", gap: 12 }}>
            <input
              className="input"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />

            <input
              className="input"
              placeholder="Password (try 6+ characters)"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />

            <button className="btn btnPrimary" type="submit">
              Register
            </button>
          </form>

          <p className={`msg ${msg ? (isError ? "msgErr" : "msgOk") : ""}`}>
            {msg}
          </p>

          <p className="sub" style={{ marginTop: 14 }}>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
