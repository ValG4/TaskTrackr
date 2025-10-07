// src/App.js - FIXED VERSION
import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Tasks from "./components/Tasks";
import CreateTask from "./components/CreateTask";
import apiService from "./services/api"; // Import the apiService instance

function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage using the SAME key as apiService
  useEffect(() => {
    const storedToken = localStorage.getItem("authToken"); // Changed from "token" to "authToken"
    const storedUser = localStorage.getItem('user');

    console.log("App loading - storedToken:", storedToken);
    console.log("App loading - storedUser:", storedUser);

    setToken(storedToken || null);

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Error parsing stored user:", e);
        setUser(null);
      }
    } else {
      setUser(null);
    }

    // Sync the apiService token
    if (storedToken) {
      apiService.setToken(storedToken);
    }

    setIsLoading(false);
  }, []);

  const handleLogin = (newToken, userData) => {
    console.log("Login called with:", { newToken, userData });
    setToken(newToken);
    setUser(userData);
    localStorage.setItem("authToken", newToken); // Changed from "token" to "authToken"
    localStorage.setItem('user', JSON.stringify(userData));
    apiService.setToken(newToken); // Sync with apiService
  };

  const handleLogout = () => {
    console.log("Logout called");
    setToken(null);
    setUser(null);
    localStorage.removeItem("authToken"); // Changed from "token" to "authToken"
    localStorage.removeItem("user");
    apiService.removeToken(); // Sync with apiService
  };

  // Debug current state
  console.log("=== APP RENDER ===");
  console.log("isLoading:", isLoading);
  console.log("token:", token);
  console.log("user:", user);

  // Show loading while checking authentication
  if (isLoading) {
    return <div>Loading application...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            !token ? (
              <Login onLogin={handleLogin} />
            ) : (
              <Navigate to="/tasks" replace />
            )
          }
        />
        <Route
          path="/tasks"
          element={
            token ? (
              <Tasks
                token={token}
                user={user}
                onLogout={handleLogout}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/create-task"
          element={
            token ? (
              <CreateTask user={user} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/"
          element={
            <Navigate to={token ? "/tasks" : "/login"} replace />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;