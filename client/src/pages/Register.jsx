import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiFetch, setToken } from "../api/http";

export default function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function handleRegister(e) {
    e.preventDefault();
    setMsg("Creating account...");

    try {
      // 1) Register
      await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      // 2) Auto-login right after registering
      const loginData = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      setToken(loginData.token);
      setMsg("✅ Account created & logged in!");
      navigate("/dashboard");
    } catch (err) {
      setMsg("❌ " + err.message);
    }
  }

  return (
    <div
      style={{
        padding: 24,
        fontFamily: "Arial",
        maxWidth: 420,
        margin: "0 auto",
      }}
    >
      <h2>Create account</h2>

      <form onSubmit={handleRegister} style={{ display: "grid", gap: 10 }}>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          placeholder="Password (min 6 recommended)"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Register</button>
      </form>

      <p style={{ marginTop: 16 }}>{msg}</p>

      <p style={{ marginTop: 12 }}>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}
