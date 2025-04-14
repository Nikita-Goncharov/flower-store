import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders } from "../redux/slices/ordersSlice";
import { useNavigate } from "react-router-dom";
import "../design/Orders.css";

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
    return <p className="orders-error">Будь ласка, авторизуйтесь.</p>;
  }

  return (
    <div className="orders-container">
      <h2 className="orders-heading">Ваші замовлення</h2>

      {status === "loading" && <p className="orders-loading">Завантаження...</p>}
      {error && <p className="orders-error">Помилка: {error}</p>}

      {list.length === 0 && status === "succeeded" && (
        <p className="orders-loading">Немає замовлень.</p>
      )}

      <ul className="order-list">
        {list.map((order) => (
          <li key={order.id} className="order-item">
            <img src={order.flower.img_link} alt="Flower img"/>
            <div>
              <p><strong>ID замовлення:</strong> {order.id}</p>
              <p><strong>Статус:</strong> {order.status}</p>
              {order.flower && (
                <p>
                  <strong>Квітка:</strong> {order.flower.name}, 
                  <strong> Ціна:</strong> {order.flower.price} грн, 
                  <strong> Тип:</strong> {order.flower.type}
                </p>
              )}
              <p><strong>Кількість:</strong> {order.quantity}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Orders;
