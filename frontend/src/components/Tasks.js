// src/components/Tasks.js - WITH WORKING CHART TOGGLE
import { useState, useEffect, useRef } from "react";
import { getTasks, updateTask, deleteTask } from "../services/api";
import { useNavigate } from "react-router-dom";
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import "../css/tasks.css";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Tasks({ token, user, onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [chartType, setChartType] = useState("status");
  const navigate = useNavigate();
  const tasksSectionRef = useRef(null);
  const hasInitializedRef = useRef(false);

  const getUserId = () => {
    if (user && user.id) return user.id;
    return 1;
  };

  const fetchTasks = async () => {
    setLoading(true);
    setError("");
    try {
      const userId = getUserId();
      const tasksData = await getTasks(userId);
      setTasks(tasksData.tasks || tasksData);
    } catch (err) {
      setError("Failed to fetch tasks: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasInitializedRef.current) {
      fetchTasks();
      hasInitializedRef.current = true;
    }
  }, []);

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        window.scrollTo(0, 0);
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [loading]);

  useEffect(() => {
    if (tasksSectionRef.current) {
      tasksSectionRef.current.scrollTop = 0;
    }
  }, [activeFilter]);

  const handleUpdateTask = async (taskId, updates) => {
    try {
      await updateTask(taskId, updates);
      fetchTasks();
    } catch (err) {
      setError("Failed to update task: " + err.message);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(taskId);
      fetchTasks();
    } catch (err) {
      setError("Failed to delete task: " + err.message);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (activeFilter === "all") return true;
    return task.status === activeFilter;
  });

  // COMPLETE task stats including priority
  const taskStats = {
    total: tasks.length,
    notStarted: tasks.filter(task => task.status === "pending").length,
    inProgress: tasks.filter(task => task.status === "in-progress").length,
    completed: tasks.filter(task => task.status === "completed").length,
    low: tasks.filter(task => task.priority === "low").length,
    medium: tasks.filter(task => task.priority === "medium").length,
    high: tasks.filter(task => task.priority === "high").length,
  };

  // STATUS Chart Data
  const statusChartData = {
    labels: ['Not Started', 'In Progress', 'Completed'],
    datasets: [{
      data: [taskStats.notStarted, taskStats.inProgress, taskStats.completed],
      backgroundColor: ['#FFA502', '#1E90FF', '#2ED573'],
      borderColor: ['#FFA502', '#1E90FF', '#2ED573'],
      borderWidth: 2,
    }],
  };

  // PRIORITY Chart Data
  const priorityChartData = {
    labels: ['Low Priority', 'Medium Priority', 'High Priority'],
    datasets: [{
      data: [taskStats.low, taskStats.medium, taskStats.high],
      backgroundColor: ['#2ED573', '#FFA502', '#FF4757'],
      borderColor: ['#2ED573', '#FFA502', '#FF4757'],
      borderWidth: 2,
    }],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' },
      title: {
        display: true,
        text: chartType === 'status' ? 'Task Status Distribution' : 'Task Priority Distribution',
        font: { size: 16, weight: 'bold' }
      },
    },
  };

  // Get the current chart data based on chartType
  const currentChartData = chartType === 'status' ? statusChartData : priorityChartData;

  /*if (loading) return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-text">
            <h1>Welcome, {user?.username || "User"}!</h1>
            <p>Here's your task dashboard</p>
          </div>
          <button className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>
      <div className="loading">Loading your dashboard...</div>
    </div>
  );*/

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-text">
            <h1>Welcome, {user?.username || "User"}! </h1>
            <p>Here's your task dashboard</p>
          </div>
          <button className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      {error && (
        <div className="error-message">
          ⚠️ ERROR: {error}
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card total"><h3>Total Tasks</h3><div className="stat-number">{taskStats.total}</div></div>
        <div className="stat-card pending"><h3>Not Started</h3><div className="stat-number">{taskStats.notStarted}</div></div>
        <div className="stat-card in-progress"><h3>In Progress</h3><div className="stat-number">{taskStats.inProgress}</div></div>
        <div className="stat-card completed"><h3>Completed</h3><div className="stat-number">{taskStats.completed}</div></div>
      </div>

      <div className="dashboard-content">
        <div className="pie-chart-section">
          <div className="chart-header">
            <h2>Task Overview</h2>
            <div className="chart-toggle">
              <button
                className={chartType === 'status' ? 'active' : ''}
                onClick={() => setChartType('status')}
              >
                Status
              </button>
              <button
                className={chartType === 'priority' ? 'active' : ''}
                onClick={() => setChartType('priority')}
              >
                Priority
              </button>
            </div>
          </div>
          {taskStats.total > 0 ? (
            <div className="pie-chart-container">
              <Pie data={currentChartData} options={chartOptions} />
            </div>
          ) : (
            <div className="empty-chart">
              <p>No tasks yet. Create your first task to see the chart!</p>
            </div>
          )}
        </div>

        <div className="tasks-section">
          <div className="section-header">
            <h2>Your Tasks</h2>
            <div className="section-actions">
              <div className="filter-tabs">
                <button className={activeFilter === "all" ? "tab active" : "tab"} onClick={() => setActiveFilter("all")}>All ({taskStats.total})</button>
                <button className={activeFilter === "pending" ? "tab active" : "tab"} onClick={() => setActiveFilter("pending")}>Not Started ({taskStats.notStarted})</button>
                <button className={activeFilter === "in-progress" ? "tab active" : "tab"} onClick={() => setActiveFilter("in-progress")}>In Progress ({taskStats.inProgress})</button>
                <button className={activeFilter === "completed" ? "tab active" : "tab"} onClick={() => setActiveFilter("completed")}>Completed ({taskStats.completed})</button>
              </div>
              <button className="add-task-btn-header" onClick={() => navigate('/create-task')}>+ Add Task</button>
            </div>
          </div>

          <div className="tasks-scroll-container" ref={tasksSectionRef}>
            <div className="tasks-list">
              {filteredTasks.length > 0 ? (
                filteredTasks.map(task => (
                  <div key={task.id} className={`task-card ${task.priority} ${task.status}`}>
                    <div className="task-header">
                      <h3 className="task-title">{task.title}</h3>
                      <div className="task-meta">
                        <span className={`priority-badge ${task.priority}`}>{task.priority}</span>
                        <span className={`status-badge ${task.status}`}>
                          {task.status === 'pending' ? 'Not Started' : task.status === 'in-progress' ? 'In Progress' : 'Completed'}
                        </span>
                      </div>
                    </div>
                    {task.description && <p className="task-description">{task.description}</p>}
                    <div className="task-actions">
                      {task.status !== "completed" && (
                        <>
                          <button className="btn-complete" onClick={() => handleUpdateTask(task.id, { status: "completed" })}>✅ Complete</button>
                          <button className="btn-progress" onClick={() => handleUpdateTask(task.id, { status: "in-progress" })}>🔄 In Progress</button>
                        </>
                      )}
                      <button className="btn-delete" onClick={() => handleDeleteTask(task.id)}>🗑️ Delete</button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <p>No tasks found. {activeFilter !== "all" ? `Try changing the filter.` : `Create your first task!`}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}