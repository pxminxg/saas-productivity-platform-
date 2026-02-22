import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch, clearToken, getToken } from "../api/http";

export default function Dashboard() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tasks, setTasks] = useState([]);
  const [msg, setMsg] = useState("");
  const [isError, setIsError] = useState(false);

  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.isCompleted).length;
    const open = total - done;
    return { total, done, open };
  }, [tasks]);

  async function loadTasks() {
    try {
      setIsError(false);
      const data = await apiFetch("/tasks");
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      setIsError(true);
      setMsg(err.message);
    }
  }

  async function createTask(e) {
    e.preventDefault();
    if (!title.trim()) {
      setIsError(true);
      setMsg("Title is required.");
      return;
    }

    try {
      setIsError(false);
      setMsg("Creating task...");
      const created = await apiFetch("/tasks", {
        method: "POST",
        body: JSON.stringify({ title, description }),
      });

      setTitle("");
      setDescription("");
      setTasks((prev) => [created, ...prev]);
      setMsg("Task created!");
    } catch (err) {
      setIsError(true);
      setMsg(err.message);
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
      setIsError(true);
      setMsg(err.message);
    }
  }

  async function removeTask(taskId) {
    try {
      await apiFetch(`/tasks/${taskId}`, { method: "DELETE" });
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      setIsError(false);
      setMsg("Task deleted!");
    } catch (err) {
      setIsError(true);
      setMsg(err.message);
    }
  }

  function logout() {
    clearToken();
    navigate("/login");
  }

  useEffect(() => {
    if (!getToken()) {
      navigate("/login");
      return;
    }
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container">
      {/* Top bar */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="cardPad row spread">
          <div>
            <h1 className="h1">Dashboard</h1>
            <p className="sub" style={{ marginBottom: 0 }}>
              Your personal task space. Fast, clean, simple.
            </p>
          </div>

          <div
            className="row"
            style={{ flexWrap: "wrap", justifyContent: "flex-end" }}
          >
            <span className="badge">Total: {stats.total}</span>
            <span className="badge">Open: {stats.open}</span>
            <span className="badge">Done: {stats.done}</span>
            <button className="btn" onClick={loadTasks}>
              Refresh
            </button>
            <button className="btn btnDanger" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="grid2">
        {/* Create Task */}
        <div className="card">
          <div className="cardPad">
            <h3 style={{ marginTop: 0, marginBottom: 10 }}>Create task</h3>

            <form onSubmit={createTask} style={{ display: "grid", gap: 10 }}>
              <input
                className="input"
                placeholder="Task title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <input
                className="input"
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <button className="btn btnPrimary" type="submit">
                Add Task
              </button>
            </form>

            {msg ? (
              <p className={`msg ${isError ? "msgErr" : "msgOk"}`}>{msg}</p>
            ) : null}
          </div>
        </div>

        {/* Tasks */}
        <div className="card">
          <div className="cardPad">
            <div className="row spread" style={{ marginBottom: 10 }}>
              <h3 style={{ margin: 0 }}>My tasks</h3>
              <span className="badge">Synced with DB</span>
            </div>

            <hr className="hr" />

            {tasks.length === 0 ? (
              <p className="sub" style={{ margin: 0 }}>
                No tasks yet. Add your first one ✨
              </p>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {tasks.map((t) => (
                  <div
                    key={t.id}
                    className="card"
                    style={{
                      background: "var(--panel-2)",
                      borderRadius: 14,
                      boxShadow: "none",
                    }}
                  >
                    <div className="cardPad" style={{ padding: 14 }}>
                      <div className="row spread">
                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              fontWeight: 700,
                              textDecoration: t.isCompleted
                                ? "line-through"
                                : "none",
                            }}
                          >
                            {t.title}
                          </div>
                          {t.description ? (
                            <div
                              className="sub"
                              style={{ margin: "6px 0 0 0" }}
                            >
                              {t.description}
                            </div>
                          ) : null}
                        </div>

                        <div
                          className="row"
                          style={{
                            flexWrap: "wrap",
                            justifyContent: "flex-end",
                          }}
                        >
                          <button
                            className="btn"
                            onClick={() => toggleComplete(t)}
                          >
                            {t.isCompleted ? "Undo" : "Complete"}
                          </button>
                          <button
                            className="btn btnDanger"
                            onClick={() => removeTask(t.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
