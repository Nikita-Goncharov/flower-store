// src/components/Header.js

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../design/HeaderFooter.css";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../redux/slices/authSlice";

function Header({ cartItems = [] }) {
  const itemCount = cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
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
      <Link to="/cart" className="nav-link cart-link">
        Cart
        {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
      </Link>

      {/* Якщо користувач не авторизований, показуємо Register/Login */}
      {!isAuthenticated && (
        <>
          <Link to="/register" className="nav-link">Register</Link>
          <Link to="/login" className="nav-link">Login</Link>
        </>
      )}

      {/* Якщо авторизований, показуємо посилання на Orders і кнопку Logout */}
      {isAuthenticated && (
        <>
          <Link to="/orders" className="nav-link">My Orders</Link>
          <button onClick={handleLogout} className="nav-link">
            Logout
          </button>
        </>
      )}
    </nav>
  );
}

export default Header;
