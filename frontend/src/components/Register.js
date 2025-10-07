// src/components/Register.js
import { useState } from "react";
import { registerUser } from "../services/api";
import "../css/login.css";

export default function Register({ onRegister }) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: ""
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const result = await registerUser(formData);
      console.log('Registration successful:', result);
      alert('Registration successful! Please login.');
      onRegister(); // Go back to login
    } catch (err) {
      setError(err.message || "Registration failed");
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Create Account</h2>
        {error && <div className="error" style={{color: 'red'}}>{error}</div>}

        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Register</button>

        <p>
          Already have an account? <span onClick={onRegister} style={{color: '#FF4B2B', cursor: 'pointer'}}>Login here</span>
        </p>
      </form>
    </div>
  );
}