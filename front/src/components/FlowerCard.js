// src/components/FlowerCard.js

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createOrder } from "../redux/slices/ordersSlice";

const FlowerCard = ({ flower, cartItems, setCartItems }) => {
  // Якщо з бекенду дані про кольори не приходять – приберіть блок із select.
  const [selectedColor, setSelectedColor] = useState(
    flower.colors ? flower.colors[0] : "default"
  );

  const { isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleColorChange = (event) => {
    setSelectedColor(event.target.value);
  };

  // 1) Додаємо товар у локальний кошик (якщо ви хочете, щоб користувач все одно бачив це в cart)
  // 2) Якщо користувач авторизований – одразу виконуємо createOrder на бекенд
  //    якщо ні – перенаправляємо на логін
  const handleAddToCartAndCreateOrder = async () => {
    // Спочатку – якщо не авторизований, переходимо на login
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    // Додаємо у локальний state кошика (щоб зберігати фронтенд-стан, якщо потрібно)
    const existingItem = cartItems.find(
      (item) => item.id === flower.id && item.color === selectedColor
    );
    if (existingItem) {
      setCartItems(
        cartItems.map((item) =>
          item.id === flower.id && item.color === selectedColor
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCartItems([
        ...cartItems,
        {
          id: flower.id,
          name: flower.name,
          color: selectedColor,
          price: flower.price,
          quantity: 1,
          image: flower.images
            ? flower.images[selectedColor]
            : flower.img_link,
        },
      ]);
    }

    // Викликаємо createOrder, щоб відправити запит на бекенд
    try {
      const result = await dispatch(
        createOrder({
          // Бекенд-сторона очікує поле flower_name
          flowerName: flower.name,
          quantity: 1, // або збільшувати кількість, якщо потрібно
        })
      ).unwrap();

      // Можна вивести повідомлення про успіх
      if (result.success) {
        // Наприклад, console.log("Замовлення створено успішно!");
      } else {
        // Якщо прийшло success: false
        alert("Не вдалося створити замовлення: " + result.message);
      }
    } catch (err) {
      // Помилка від бекенду
      alert("Помилка при створенні замовлення: " + err);
    }
  };

  return (
    <div className="flower-card">
      <img
        src={
          flower.images
            ? flower.images[selectedColor]
            : flower.img_link
        }
        alt={`${flower.name} - ${selectedColor}`}
      />
      <h2>{flower.name}</h2>
      <p>Ціна: {flower.price} грн</p>

      {flower.colors && (
        <select
          id="color-select"
          value={selectedColor}
          onChange={handleColorChange}
        >
          {flower.colors.map((color, index) => (
            <option key={index} value={color}>
              {color}
            </option>
          ))}
        </select>
      )}

      {/* Тут змінюємо обробник на handleAddToCartAndCreateOrder */}
      <button onClick={handleAddToCartAndCreateOrder}>Купити</button>
    </div>
  );
};

export default FlowerCard;
