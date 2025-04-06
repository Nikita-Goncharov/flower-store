// src/pages/Register.js
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../redux/slices/authSlice";

function Register() {
  const dispatch = useDispatch();
  const { status, error } = useSelector((state) => state.auth);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = (e) => {
    e.preventDefault();
    dispatch(registerUser({ username, email, password }));
  };

  return (
    <div style={{ margin: "1rem" }}>
      <h2>Реєстрація</h2>
      <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", maxWidth: 300 }}>
        <label>Username:</label>
        <input value={username} onChange={(e) => setUsername(e.target.value)} />
        
        <label>Email:</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} />
        
        <label>Password:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

        <button type="submit" disabled={status === "loading"}>Зареєструватися</button>
      </form>

      {status === "loading" && <p>Завантаження...</p>}
      {error && <p style={{ color: "red" }}>Помилка: {error}</p>}
      {status === "succeeded" && <p style={{ color: "green" }}>Реєстрація успішна!</p>}
    </div>
  );
}

export default Register;
