// src/components/TestTasks.js
import { useState, useEffect } from "react";
import "../css/tasks.css";

export default function TestTasks({ user, onLogout }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  console.log("TestTasks rendering - loading:", loading);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-text">
            <h1>Welcome, {user?.username || "User"}! 👋</h1>
            <p>Here's your task dashboard</p>
          </div>
          <button className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      {loading ? (
        <div className="loading">Loading your dashboard...</div>
      ) : (
        <div>
          <div className="stats-grid">
            <div className="stat-card total"><h3>Total Tasks</h3><div className="stat-number">5</div></div>
            <div className="stat-card pending"><h3>Not Started</h3><div className="stat-number">2</div></div>
            <div className="stat-card in-progress"><h3>In Progress</h3><div className="stat-number">1</div></div>
            <div className="stat-card completed"><h3>Completed</h3><div className="stat-number">2</div></div>
          </div>
          <p>Test content - header should stay visible</p>
        </div>
      )}
    </div>
  );
}