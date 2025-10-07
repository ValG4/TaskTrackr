// src/components/CreateTask.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTask } from "../services/api";
import "../css/CreateTask.css";

export default function CreateTask({ user }) {
  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    priority: "medium",
    due_date: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTaskData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!user || !user.id) {
        throw new Error("User not found. Please log in again.");
      }

      const userId = user.id;
      console.log("Creating task for user:", userId);

      const taskPayload = {
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        user_id: userId
      };

      if (taskData.due_date) {
        taskPayload.due_date = taskData.due_date;
      }

      await createTask(taskPayload, userId);
      // Force scroll to top when returning to dashboard
      window.scrollTo(0, 0);
      navigate('/tasks', { replace: true });

    } catch (err) {
      let errorMessage = "Failed to create task: ";
      if (err.message) {
        errorMessage += err.message;
      } else if (err.response && err.response.data) {
        errorMessage += JSON.stringify(err.response.data);
      } else if (typeof err === 'object') {
        errorMessage += JSON.stringify(err);
      } else {
        errorMessage += String(err);
      }
      setError(errorMessage);
      console.error("Create task error details:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-task-container">
      <div className="create-task-card">
        <header className="create-task-header">
          <h1>Create New Task</h1>
          <button className="back-btn" onClick={() => navigate('/tasks')}>
            ← Back to Dashboard
          </button>
        </header>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="create-task-form">
          <div className="form-group">
            <label htmlFor="title">Task Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={taskData.title}
              onChange={handleChange}
              placeholder="Enter task title"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={taskData.description}
              onChange={handleChange}
              placeholder="Enter task description (optional)"
              rows="4"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                name="priority"
                value={taskData.priority}
                onChange={handleChange}
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="due_date">Due Date (Optional)</label>
              <input
                type="datetime-local"
                id="due_date"
                name="due_date"
                value={taskData.due_date}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate('/tasks')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="create-btn"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}