// src/App.js
import { useState } from "react";
import Register from "./components/Register";
import Login from "./components/Login";
import Tasks from "./components/Tasks";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [showRegister, setShowRegister] = useState(false);

  if (!token) {
    return showRegister ? (
      <Register onRegister={() => setShowRegister(false)} />
    ) : (
      <>
        <Login onLogin={(t) => setToken(t)} />
        <button onClick={() => setShowRegister(true)}>Go to Register</button>
      </>
    );
  }

  return <Tasks token={token} />;
}

export default App;
