// src/components/Tasks.js
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
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState("monthly"); // monthly, weekly, daily
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
      backgroundColor: ['#2ed573', '#ffa502', '#ff4757'],
      borderColor: ['#2ed573', '#ffa502', '#ff4757'],
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

  // CALENDAR FUNCTIONS
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getLastDayOfPreviousMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 0).getDate();
  };

  // Handle different date formats including ISO format
  const getTasksForDate = (date) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;

      try {
        // Get the target calendar date in YYYY-MM-DD format
        const targetYear = date.getFullYear();
        const targetMonth = date.getMonth() + 1;
        const targetDay = date.getDate();
        const targetDateStr = `${targetYear}-${targetMonth.toString().padStart(2, '0')}-${targetDay.toString().padStart(2, '0')}`;

        // Parse task due date - handle different formats
        let taskDateStr;
        if (task.dueDate.includes('T')) {
          // ISO format: 2025-10-15T16:20:00Z
          taskDateStr = task.dueDate.split('T')[0];
        } else if (task.dueDate.includes(' ')) {
          // Database format: 2025-10-15 16:20:00+00
          taskDateStr = task.dueDate.split(' ')[0];
        } else {
          // Date-only format: 2025-10-15
          taskDateStr = task.dueDate;
        }

        // Compare the date strings directly
        return taskDateStr === targetDateStr;
      } catch (error) {
        return false;
      }
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ff4757';
      case 'medium': return '#ffa502';
      case 'low': return '#00A36D';
      default: return '#1E90FF';
    }
  };

  const getTaskStatusStyle = (task) => {
    const color = getPriorityColor(task.priority);
    switch (task.status) {
      case 'pending': // Not Started - Full circle
        return {
          backgroundColor: color,
          border: `2px solid ${color}`,
          borderRadius: '50%'
        };
      case 'in-progress': // In Progress - Half circle
        return {
          background: `linear-gradient(90deg, ${color} 50%, transparent 50%)`,
          border: `2px solid ${color}`,
          borderRadius: '50%'
        };
      case 'completed': // Completed - Empty circle
        return {
          backgroundColor: 'transparent',
          border: `2px solid ${color}`,
          borderRadius: '50%'
        };
      default:
        return {
          backgroundColor: color,
          border: `2px solid ${color}`,
          borderRadius: '50%'
        };
    }
  };

  const getDailyTaskStyle = (task) => {
    const color = getPriorityColor(task.priority);
    return {
      backgroundColor: color + '20', // Add transparency
      border: `2px solid ${color}`,
      borderRadius: '8px',
      padding: '2px 6px',
      margin: '1px 0',
      fontSize: '10px',
      color: '#333',
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      whiteSpace: 'nowrap'
    };
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const navigateWeek = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + (direction * 7));
      return newDate;
    });
  };

  const navigateDay = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + direction);
      return newDate;
    });
  };

  // Generate monthly calendar data
  const generateMonthlyCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const lastDayPrevMonth = getLastDayOfPreviousMonth(currentDate);

    const calendar = [];
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Add header row
    calendar.push(daysOfWeek);

    let week = [];

    // Previous month's days
    for (let i = firstDay - 1; i >= 0; i--) {
      week.push({
        date: new Date(year, month - 1, lastDayPrevMonth - i),
        isCurrentMonth: false,
        tasks: []
      });
    }

    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayTasks = getTasksForDate(date);

      week.push({
        date,
        isCurrentMonth: true,
        tasks: dayTasks
      });

      if (week.length === 7) {
        calendar.push(week);
        week = [];
      }
    }

    // Next month's days
    if (week.length > 0) {
      let nextMonthDay = 1;
      while (week.length < 7) {
        week.push({
          date: new Date(year, month + 1, nextMonthDay),
          isCurrentMonth: false,
          tasks: []
        });
        nextMonthDay++;
      }
      calendar.push(week);
    }

    return calendar;
  };

  // Generate weekly calendar data
  const generateWeeklyCalendar = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    const week = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dayTasks = getTasksForDate(date);

      week.push({
        date,
        isCurrentMonth: true,
        tasks: dayTasks
      });
    }

    return [['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], week];
  };

  // Generate daily calendar data
  const generateDailyCalendar = () => {
    const dayTasks = getTasksForDate(currentDate);

    // Sort tasks by time
    const sortedTasks = dayTasks.sort((a, b) => {
      const timeA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
      const timeB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
      return timeA - timeB;
    });

    return {
      date: currentDate,
      tasks: sortedTasks
    };
  };

  const getCalendarData = () => {
    switch (calendarView) {
      case 'weekly':
        return generateWeeklyCalendar();
      case 'daily':
        return generateDailyCalendar();
      default:
        return generateMonthlyCalendar();
    }
  };

  const getNavigationHandler = () => {
    switch (calendarView) {
      case 'weekly':
        return navigateWeek;
      case 'daily':
        return navigateDay;
      default:
        return navigateMonth;
    }
  };

  const getNavigationLabel = () => {
    switch (calendarView) {
      case 'weekly':
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        return `${startOfWeek.toLocaleDateString()} - ${endOfWeek.toLocaleDateString()}`;
      case 'daily':
        return currentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      default:
        const monthNames = ["January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"];
        return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    }
  };

  const calendarData = getCalendarData();
  const navigateHandler = getNavigationHandler();

  // Render different calendar views
  const renderMonthlyCalendar = () => {
    const calendar = calendarData;
    return (
      <table className="calendar-table">
        <thead>
          <tr>
            {calendar[0]?.map((day, index) => (
              <th key={index}>{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {calendar.slice(1).map((week, weekIndex) => (
            <tr key={weekIndex}>
              {week.map((day, dayIndex) => (
                <td
                  key={dayIndex}
                  className={`calendar-day ${day.isCurrentMonth ? 'current-month' : 'other-month'} ${
                    day.date.toDateString() === new Date().toDateString() ? 'today' : ''
                  }`}
                >
                  <div className="day-number">{day.date.getDate()}</div>
                  <div className="day-tasks">
                    {day.tasks.map((task, taskIndex) => (
                      <div
                        key={taskIndex}
                        className="task-indicator"
                        style={getTaskStatusStyle(task)}
                        title={`${task.title} (${task.priority} priority - ${task.status})`}
                      />
                    ))}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const renderWeeklyCalendar = () => {
    const calendar = calendarData;
    return (
      <table className="calendar-table weekly-view">
        <thead>
          <tr>
            {calendar[0]?.map((day, index) => (
              <th key={index}>{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {calendar[1]?.map((day, dayIndex) => (
              <td
                key={dayIndex}
                className={`calendar-day ${day.isCurrentMonth ? 'current-month' : 'other-month'} ${
                  day.date.toDateString() === new Date().toDateString() ? 'today' : ''
                }`}
              >
                <div className="day-number">{day.date.getDate()}</div>
                <div className="day-tasks">
                  {day.tasks.map((task, taskIndex) => (
                    <div
                      key={taskIndex}
                      className="task-indicator"
                      style={getTaskStatusStyle(task)}
                      title={`${task.title} (${task.priority} priority - ${task.status})`}
                    />
                  ))}
                </div>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    );
  };

  const renderDailyCalendar = () => {
    const dayData = calendarData;
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="daily-calendar">
        <div className="daily-header">
          <div className="hour-column">Time</div>
          <div className="tasks-column">Tasks</div>
        </div>
        <div className="daily-content">
          {hours.map(hour => (
            <div key={hour} className="hour-row">
              <div className="hour-label">
                {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
              </div>
              <div className="hour-tasks">
                {dayData.tasks.filter(task => {
                  if (!task.dueDate) return false;
                  const taskHour = new Date(task.dueDate).getHours();
                  return taskHour === hour;
                }).map((task, taskIndex) => (
                  <div
                    key={taskIndex}
                    className="daily-task"
                    style={getDailyTaskStyle(task)}
                    title={`${task.title} (${task.priority} priority - ${task.status})`}
                  >
                    {task.title}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCalendar = () => {
    switch (calendarView) {
      case 'weekly':
        return renderWeeklyCalendar();
      case 'daily':
        return renderDailyCalendar();
      default:
        return renderMonthlyCalendar();
    }
  };

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
        <div className="charts-column">
          {/* PIE CHART SECTION */}
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

          {/* TASK CALENDAR SECTION */}
          <div className="calendar-section">
            <div className="calendar-header">
              <h2>Task Calendar</h2>
              <div className="calendar-controls">
                <div className="calendar-view-toggle">
                  <button
                    className={calendarView === 'monthly' ? 'active' : ''}
                    onClick={() => setCalendarView('monthly')}
                  >
                    Monthly
                  </button>
                  <button
                    className={calendarView === 'weekly' ? 'active' : ''}
                    onClick={() => setCalendarView('weekly')}
                  >
                    Weekly
                  </button>
                  <button
                    className={calendarView === 'daily' ? 'active' : ''}
                    onClick={() => setCalendarView('daily')}
                  >
                    Daily
                  </button>
                </div>
                <div className="calendar-navigation">
                  <button onClick={() => navigateHandler(-1)}>‹</button>
                  <span>{getNavigationLabel()}</span>
                  <button onClick={() => navigateHandler(1)}>›</button>
                </div>
              </div>
            </div>
            <div className="calendar-container">
              {renderCalendar()}
            </div>
            <div className="calendar-legend">
              <div className="legend-item">
                <div className="legend-color high"></div>
                <span>High Priority</span>
              </div>
              <div className="legend-item">
                <div className="legend-color medium"></div>
                <span>Medium Priority</span>
              </div>
              <div className="legend-item">
                <div className="legend-color low"></div>
                <span>Low Priority</span>
              </div>
              <div className="legend-item">
                <div className="status-legend full"></div>
                <span>Not Started</span>
              </div>
              <div className="legend-item">
                <div className="status-legend half"></div>
                <span>In Progress</span>
              </div>
              <div className="legend-item">
                <div className="status-legend empty"></div>
                <span>Completed</span>
              </div>
            </div>
          </div>
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
                    {task.dueDate && (
                      <div className="task-due-date">
                        📅 Due: {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    )}
                      <div className="task-actions">
                          {task.status !== "completed" && (
                            <>
                              <button
                                className="action-btn btn-complete"
                                onClick={() => handleUpdateTask(task.id, { status: "completed" })}
                                title="Mark as Complete"
                              >
                                <span className="icon">✓</span>
                                <span className="text">Complete</span>
                              </button>

                               <button
                                className="action-btn btn-edit"
                                onClick={() => navigate(`/edit-task/${task.id}`)}
                                title="Edit Task"
                              >
                                <span className="icon">✎</span>
                                <span className="text">Edit</span>
                              </button>

                              <button
                                className="action-btn btn-progress"
                                onClick={() => handleUpdateTask(task.id, { status: "in-progress" })}
                                title="Mark as In Progress"
                              >
                                <span className="icon">↻</span>
                                <span className="text">In Progress</span>
                              </button>
                            </>
                          )}

                          <button
                            className="action-btn btn-delete"
                            onClick={() => handleDeleteTask(task.id)}
                            title="Delete Task"
                          >
                            <span className="icon">×</span>
                            <span className="text">Delete</span>
                          </button>
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