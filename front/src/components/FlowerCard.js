// src/components/FlowerCard.js

import React, { useState } from "react";

const FlowerCard = ({ flower, cartItems, setCartItems }) => {
  // Якщо з бекенду дані про кольори не приходять, адаптуйте під себе
  const [selectedColor, setSelectedColor] = useState(
    flower.colors ? flower.colors[0] : "default"
  );

  const handleColorChange = (event) => {
    setSelectedColor(event.target.value);
  };

  const handleAddToCart = () => {
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
          // Якщо ваш бекенд не має images для кожного кольору, використайте flower.img_link 
          image: flower.images ? flower.images[selectedColor] : flower.img_link,
        },
      ]);
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
        <select id="color-select" value={selectedColor} onChange={handleColorChange}>
          {flower.colors.map((color, index) => (
            <option key={index} value={color}>
              {color}
            </option>
          ))}
        </select>
      )}
      <button onClick={handleAddToCart}>Купити</button>
    </div>
  );
};

export default FlowerCard;
