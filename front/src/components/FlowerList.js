// src/components/FlowerList.js
import React from "react";
import FlowerCard from "./FlowerCard";

const FlowerList = ({ flowers, cartItems, setCartItems }) => {
  return (
    <div className="flower-list">
      {flowers.map((flower) => (
        <FlowerCard
          key={flower.id}
          flower={flower}
          cartItems={cartItems}
          setCartItems={setCartItems}
        />
      ))}
    </div>
  );
};

export default FlowerList;
