// src/components/Header.js

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../design/HeaderFooter.css";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../redux/slices/authSlice";

function Header({ cartItems = [] }) {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logoutUser()).then(() => {
      navigate("/login");
    });
  };

  return (
    <nav className="header">
      <Link to="/" className="nav-link">Flower Shop</Link>
      <Link to="/catalog" className="nav-link">Catalog</Link>
      {!isAuthenticated && (
        <>
          <Link to="/register" className="nav-link">Register</Link>
          <Link to="/login" className="nav-link">Login</Link>
        </>
      )}

      {isAuthenticated && (
        <>
          <Link to="/orders" className="nav-link">My Orders</Link>
          <button onClick={handleLogout} className="nav-link logout-btn">
            Logout
          </button>
        </>
      )}
    </nav>
  );
}

export default Header;
