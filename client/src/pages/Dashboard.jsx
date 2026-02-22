import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch, clearToken, getToken } from "../api/http";
import Toast from "../components/Toast";

export default function Dashboard() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [toast, setToast] = useState(null);
  const clearToast = () => setToast(null);

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("newest");

  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.isCompleted).length;
    const open = total - done;
    return { total, done, open };
  }, [tasks]);

  const visibleTasks = useMemo(() => {
    let list = [...tasks];

    if (filter === "open") list = list.filter((t) => !t.isCompleted);
    if (filter === "done") list = list.filter((t) => t.isCompleted);

    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((t) => {
        const a = (t.title || "").toLowerCase();
        const b = (t.description || "").toLowerCase();
        return a.includes(q) || b.includes(q);
      });
    }

    if (sort === "newest")
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sort === "oldest")
      list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    if (sort === "az")
      list.sort((a, b) => (a.title || "").localeCompare(b.title || ""));

    return list;
  }, [tasks, query, filter, sort]);

  async function loadTasks() {
    try {
      setLoading(true);
      const data = await apiFetch("/tasks");
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      setToast({ type: "error", title: "Fetch failed", message: err.message });
    } finally {
      setLoading(false);
    }
  }

  async function createTask(e) {
    e.preventDefault();
    if (!title.trim()) {
      setToast({
        type: "error",
        title: "Missing title",
        message: "Task title is required.",
      });
      return;
    }

    try {
      const created = await apiFetch("/tasks", {
        method: "POST",
        body: JSON.stringify({ title, description }),
      });

      setTitle("");
      setDescription("");
      setTasks((prev) => [created, ...prev]);
      setToast({ type: "success", title: "Created", message: "Task added." });
    } catch (err) {
      setToast({ type: "error", title: "Create failed", message: err.message });
    }
  }

  async function toggleComplete(task) {
    try {
      const updated = await apiFetch(`/tasks/${task.id}`, {
        method: "PUT",
        body: JSON.stringify({ isCompleted: !task.isCompleted }),
      });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
      setToast({
        type: "success",
        title: "Updated",
        message: updated.isCompleted ? "Marked complete." : "Marked open.",
      });
    } catch (err) {
      setToast({ type: "error", title: "Update failed", message: err.message });
    }
  }

  async function removeTask(taskId) {
    try {
      await apiFetch(`/tasks/${taskId}`, { method: "DELETE" });
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      setToast({ type: "success", title: "Deleted", message: "Task removed." });
    } catch (err) {
      setToast({ type: "error", title: "Delete failed", message: err.message });
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
      <Toast toast={toast} clearToast={clearToast} />

      <div className="card" style={{ marginBottom: 14 }}>
        <div className="cardPad row spread">
          <div>
            <h1 className="h1">Dashboard</h1>
            <p className="sub" style={{ marginBottom: 0 }}>
              Linear-style productivity. Clean, fast, focused.
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

      <div className="grid2">
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
          </div>
        </div>

        <div className="card">
          <div className="cardPad">
            <div className="row spread" style={{ marginBottom: 10 }}>
              <h3 style={{ margin: 0 }}>My tasks</h3>
              <span className="badge">{loading ? "Loading..." : "Synced"}</span>
            </div>

            <div style={{ display: "grid", gap: 10, marginBottom: 12 }}>
              <input
                className="input"
                placeholder="Search tasks..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />

              <div className="row" style={{ flexWrap: "wrap" }}>
                <button className="btn" onClick={() => setFilter("all")}>
                  All
                </button>
                <button className="btn" onClick={() => setFilter("open")}>
                  Open
                </button>
                <button className="btn" onClick={() => setFilter("done")}>
                  Completed
                </button>

                <span style={{ width: 8 }} />

                <select
                  className="input"
                  style={{ width: 170, padding: "10px 12px" }}
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="az">A–Z</option>
                </select>
              </div>
            </div>

            <hr className="hr" />

            {loading ? (
              <div style={{ display: "grid", gap: 10 }}>
                <div className="skeleton" style={{ height: 64 }} />
                <div className="skeleton" style={{ height: 64 }} />
                <div className="skeleton" style={{ height: 64 }} />
              </div>
            ) : visibleTasks.length === 0 ? (
              <p className="sub" style={{ margin: 0 }}>
                No tasks found.
              </p>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {visibleTasks.map((t) => (
                  <div
                    key={t.id}
                    className="card"
                    style={{
                      background: "var(--surface2)",
                      borderRadius: 14,
                      boxShadow: "none",
                    }}
                  >
                    <div className="cardPad" style={{ padding: 14 }}>
                      <div className="row spread">
                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              fontWeight: 750,
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
