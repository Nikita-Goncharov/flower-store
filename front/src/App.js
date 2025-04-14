// src/App.js

import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Orders from "./pages/Orders";

function App() {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("cartItems");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  return (
    <Router>
      <div className="app">
        <Header cartItems={cartItems} />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/catalog"
              element={<Catalog cartItems={cartItems} setCartItems={setCartItems} />}
            />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/orders" element={<Orders />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
