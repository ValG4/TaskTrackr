// src/components/Login.js
import { useState, useEffect } from "react";
import { loginUser, registerUser } from "../services/api";
import "../css/login.css";

export default function Login({ onLogin }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");


const handleLogin = async (e) => {
  e.preventDefault();
  setError("");
  try {
    const result = await loginUser({
      email: username,
      password: password
    });

    if (result.access_token) {
      localStorage.setItem("token", result.access_token);
      onLogin(result.access_token, result.user); // Pass user data
    } else {
      setError("Login failed - no token received");
    }
  } catch (err) {
    setError("Login failed: " + err.message);
  }
};

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const result = await registerUser({
        username: newUser.name,
        email: newUser.email,
        password: newUser.password
      });
      console.log('Registration successful:', result);
      alert('Registration successful! Please login with your new account.');
      setIsSignUp(false);
      // Clear the form
      setNewUser({ name: "", email: "", password: "" });
    } catch (err) {
      setError("Registration failed: " + err.message);
    }
  };

  useEffect(() => {
    const container = document.getElementById("container");
    if (isSignUp) {
      container?.classList.add("right-panel-active");
    } else {
      container?.classList.remove("right-panel-active");
    }
  }, [isSignUp]);

  return (
    <div className="container" id="container">
      {/* Sign Up Form */}
      <div className="form-container sign-up-container">
        <form onSubmit={handleSignUp}>
          <h1>Create Account</h1>
          <span>or use your email for registration</span>
          {error && isSignUp && <div className="error" style={{color: 'red', fontSize: '14px'}}>{error}</div>}
          <input
            type="text"
            placeholder="Name"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            required
          />
          <button type="submit">Sign Up</button>
        </form>
      </div>

      {/* Sign In Form */}
    <div className="form-container sign-in-container">
      <form onSubmit={handleLogin}>
        <h1>Sign in</h1>
        <span>or use your account</span>
        {error && !isSignUp && <div className="error" style={{color: 'red', fontSize: '14px'}}>{error}</div>}
        {/* CHANGE: Update placeholder from "Username" to "Email" */}
        <input
          type="email"  // Change from "text" to "email"
          placeholder="Email"  // Change from "Username" to "Email"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <a href="#">Forgot your password?</a>
        <button type="submit">Sign In</button>
      </form>
    </div>

      {/* Overlay with Sliding Animation */}
      <div className="overlay-container">
        <div className="overlay">
          <div className="overlay-panel overlay-left">
            <h1>Welcome Back!</h1>
            <p>To keep connected with us please login with your personal info</p>
            <button className="ghost" onClick={() => setIsSignUp(false)}>
              Sign In
            </button>
          </div>
          <div className="overlay-panel overlay-right">
            <h1>Hello, Friend!</h1>
            <p>Enter your personal details and start your journey with us</p>
            <button className="ghost" onClick={() => setIsSignUp(true)}>
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}