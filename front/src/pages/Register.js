import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../redux/slices/authSlice";
import { useNavigate } from "react-router-dom";

import "../design/AuthForms.css";

function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { status, error } = useSelector((state) => state.auth);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    await dispatch(registerUser({ username, email, password }));
    navigate("/login");
  };

  return (
    <div className="auth-container">
      <h2>Register</h2>
      <form onSubmit={handleRegister} className="auth-form">
        <label htmlFor="reg-username">Username:</label>
        <input
          id="reg-username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <label htmlFor="reg-email">Email:</label>
        <input
          id="reg-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label htmlFor="reg-password">Password:</label>
        <input
          id="reg-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" disabled={status === "loading"}>
        Sign up
        </button>
      </form>

      {status === "loading" && <p>Loading...</p>}
      {error && <p className="error-message">Error: {error}</p>}
    </div>
  );
}

export default Register;
