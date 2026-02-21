import { useEffect, useState } from "react";
import { apiFetch, setToken, clearToken, getToken } from "./api/http";

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [tasks, setTasks] = useState([]);
  const [msg, setMsg] = useState("");

  const loggedIn = !!getToken();

  async function handleLogin(e) {
    e.preventDefault();
    setMsg("Logging in...");

    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      setToken(data.token);
      setMsg("✅ Logged in!");
      await loadTasks();
    } catch (err) {
      setMsg("❌ " + err.message);
    }
  }

  function handleLogout() {
    clearToken();
    setTasks([]);
    setMsg("Logged out.");
  }

  async function loadTasks() {
    try {
      const data = await apiFetch("/tasks");
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      setMsg("❌ " + err.message);
    }
  }

  async function createTask(e) {
    e.preventDefault();
    setMsg("Creating task...");

    try {
      const created = await apiFetch("/tasks", {
        method: "POST",
        body: JSON.stringify({ title, description }),
      });

      setTitle("");
      setDescription("");
      setMsg("✅ Task created!");
      setTasks((prev) => [created, ...prev]);
    } catch (err) {
      setMsg("❌ " + err.message);
    }
  }

  async function toggleComplete(task) {
    try {
      const updated = await apiFetch(`/tasks/${task.id}`, {
        method: "PUT",
        body: JSON.stringify({ isCompleted: !task.isCompleted }),
      });

      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    } catch (err) {
      setMsg("❌ " + err.message);
    }
  }

  async function removeTask(taskId) {
    try {
      await apiFetch(`/tasks/${taskId}`, { method: "DELETE" });
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      setMsg("✅ Task deleted!");
    } catch (err) {
      setMsg("❌ " + err.message);
    }
  }

  useEffect(() => {
    if (loggedIn) loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      style={{
        padding: 24,
        fontFamily: "Arial",
        maxWidth: 520,
        margin: "0 auto",
      }}
    >
      <h2>SaaS Productivity Platform</h2>

      {!loggedIn ? (
        <form onSubmit={handleLogin} style={{ display: "grid", gap: 10 }}>
          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Login</button>
        </form>
      ) : (
        <>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button onClick={loadTasks}>Refresh Tasks</button>
            <button onClick={handleLogout}>Logout</button>
          </div>

          <hr style={{ margin: "16px 0" }} />

          <form onSubmit={createTask} style={{ display: "grid", gap: 10 }}>
            <input
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <button type="submit">Add Task</button>
          </form>

          <h3 style={{ marginTop: 18 }}>My Tasks</h3>

          {tasks.length === 0 ? (
            <p>No tasks yet.</p>
          ) : (
            <ul style={{ paddingLeft: 18 }}>
              {tasks.map((t) => (
                <li key={t.id} style={{ marginBottom: 10 }}>
                  <div
                    style={{ display: "flex", gap: 10, alignItems: "center" }}
                  >
                    <strong
                      style={{
                        textDecoration: t.isCompleted ? "line-through" : "none",
                      }}
                    >
                      {t.title}
                    </strong>
                    <button onClick={() => toggleComplete(t)}>
                      {t.isCompleted ? "Undo" : "Complete"}
                    </button>
                    <button onClick={() => removeTask(t.id)}>Delete</button>
                  </div>
                  {t.description ? (
                    <div style={{ opacity: 0.8 }}>{t.description}</div>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <p style={{ marginTop: 16 }}>{msg}</p>
    </div>
  );
}
