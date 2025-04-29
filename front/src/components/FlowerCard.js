import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createOrder } from "../redux/slices/ordersSlice";

const FlowerCard = ({ flower, cartItems, setCartItems }) => {
  const [selectedColor, setSelectedColor] = useState(
    flower.colors ? flower.colors[0] : "default"
  );

  const { isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleColorChange = (event) => {
    setSelectedColor(event.target.value);
  };

  const handleAddToCartAndCreateOrder = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

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

    try {
      const result = await dispatch(
        createOrder({
          flowerName: flower.name,
          quantity: 1,
        })
      ).unwrap();

      if (result.success) {
      } else {
        alert("Не вдалося створити замовлення: " + result.message);
      }
    } catch (err) {
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

      <button onClick={handleAddToCartAndCreateOrder}>Купити</button>
    </div>
  );
};

export default FlowerCard;
