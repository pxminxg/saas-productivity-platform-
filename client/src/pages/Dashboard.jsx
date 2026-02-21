import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch, clearToken, getToken } from "../api/http";

export default function Dashboard() {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);

  async function loadTasks() {
    const data = await apiFetch("/tasks");
    setTasks(data);
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
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h2>Dashboard</h2>

      <button onClick={logout}>Logout</button>

      <h3>My Tasks</h3>

      {tasks.length === 0 ? (
        <p>No tasks yet</p>
      ) : (
        <ul>
          {tasks.map((t) => (
            <li key={t.id}>{t.title}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
