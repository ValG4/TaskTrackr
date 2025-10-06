// src/components/Tasks.js
import { useState, useEffect } from "react";
import { getTasks } from "../services/api";

export default function Tasks({ token }) {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    async function fetchTasks() {
      const data = await getTasks(token);
      setTasks(data);
    }
    fetchTasks();
  }, [token]);

  return (
    <div>
      <h2>Your Tasks</h2>
      <ul>
        {tasks.map((t) => (
          <li key={t.id}>
            {t.title} - {t.completed ? "✅" : "❌"}
          </li>
        ))}
      </ul>
    </div>
  );
}
