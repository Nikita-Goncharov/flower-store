// src/pages/Cart.js

import React, { useState } from "react";
import "../design/Cart.css";
import { useDispatch, useSelector } from "react-redux";
import { createOrder, resetCreateOrderStatus } from "../redux/slices/ordersSlice";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Cart = ({ cartItems, setCartItems }) => {
  const [orderMessage, setOrderMessage] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { createOrderStatus, createOrderError } = useSelector((state) => state.orders);

  useEffect(() => {
    // Якщо замовлення створено, виводимо повідомлення
    if (createOrderStatus === "succeeded") {
      setOrderMessage("Дякуємо за ваше замовлення! Ваше замовлення оформлено.");
      // Очищаємо кошик
      setCartItems([]);
      dispatch(resetCreateOrderStatus());
    }
    if (createOrderStatus === "failed" && createOrderError) {
      setOrderMessage("Помилка: " + createOrderError);
      dispatch(resetCreateOrderStatus());
    }
  }, [createOrderStatus, createOrderError, setCartItems, dispatch]);

  const handleIncreaseQuantity = (itemId, color) => {
    setCartItems(
      cartItems.map((item) =>
        item.id === itemId && item.color === color
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const handleDecreaseQuantity = (itemId, color) => {
    setCartItems(
      cartItems
        .map((item) =>
          item.id === itemId && item.color === color
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveItem = (itemId, color) => {
    setCartItems(cartItems.filter((item) => !(item.id === itemId && item.color === color)));
  };

  const handlePlaceOrder = () => {
    if (!isAuthenticated) {
      setOrderMessage("Будь ласка, увійдіть, щоб створити замовлення.");
      navigate("/login");
      return;
    }

    // Покроково викликаємо POST /orders для кожного товару
    cartItems.forEach((item) => {
      dispatch(
        createOrder({
          flowerName: item.name, // flower_name на бекенді
          quantity: item.quantity,
        })
      );
    });
  };

  const totalAmount = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="cart">
      <h2>Кошик</h2>
      {cartItems.length === 0 ? (
        <p>Ваш кошик порожній.</p>
      ) : (
        <ul>
          {cartItems.map((item) => (
            <li key={`${item.id}-${item.color}`} className="cart-item">
              <img src={item.image} alt={`${item.name} - ${item.color}`} />
              <div className="cart-item-info">
                <h3>{item.name}</h3>
                <p>Колір: {item.color}</p>
              </div>
              <p>{item.quantity}</p>
              <p>{item.price * item.quantity} грн</p>
              <div className="cart-controls">
                <button onClick={() => handleDecreaseQuantity(item.id, item.color)}>-</button>
                <button onClick={() => handleIncreaseQuantity(item.id, item.color)}>+</button>
                <button onClick={() => handleRemoveItem(item.id, item.color)}>Видалити</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {cartItems.length > 0 && (
        <>
          <div className="cart-summary">
            <p>Загальна кількість: {totalItems}</p>
            <p>Загальна сума: {totalAmount} грн</p>
          </div>
          <button onClick={handlePlaceOrder} className="order-button">
            Оформити замовлення
          </button>
        </>
      )}

      {orderMessage && <p className="order-message">{orderMessage}</p>}
    </div>
  );
};

export default Cart;
