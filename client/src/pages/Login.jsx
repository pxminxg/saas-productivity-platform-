import { useState } from "react";
import { apiFetch, setToken, getToken } from "../api/http";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
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
      setMsg("Error: " + err.message);
    }
  }

  if (getToken()) {
    navigate("/dashboard");
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>Login</h2>

      <form onSubmit={handleLogin}>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <br />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <br />

        <button type="submit">Login</button>
      </form>

      <p>{msg}</p>
      <p style={{ marginTop: 12 }}>
        New here? <Link to="/register">Create an account</Link>
      </p>
    </div>
  );
}
