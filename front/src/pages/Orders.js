// src/pages/Orders.js
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders } from "../redux/slices/ordersSlice";
import { useNavigate } from "react-router-dom";

function Orders() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { list, status, error } = useSelector((state) => state.orders);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    dispatch(fetchOrders());
  }, [dispatch, navigate, isAuthenticated]);

  if (!isAuthenticated) {
    return <p>Будь ласка, авторизуйтесь.</p>;
  }

  return (
    <div style={{ margin: "1rem" }}>
      <h2>Ваші замовлення</h2>
      {status === "loading" && <p>Завантаження...</p>}
      {error && <p style={{ color: "red" }}>Помилка: {error}</p>}
      {list.length === 0 && status === "succeeded" && (
        <p>Немає замовлень.</p>
      )}
      <ul>
        {list.map((order) => (
          <li key={order.id} style={{ marginBottom: "1rem", border: "1px solid #ccc", padding: "0.5rem" }}>
            <p>ID замовлення: {order.id}</p>
            <p>Статус: {order.status}</p>
            {order.flower && (
              <p>
                Квітка: {order.flower.name}, Ціна: {order.flower.price}, Тип: {order.flower.type}
              </p>
            )}
            <p>Кількість: {order.quantity}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Orders;
