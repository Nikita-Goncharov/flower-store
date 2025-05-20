import React from "react";

const FlowerCard = ({ flower, buyFlowerCallback }) => {
  const buyCallback = (e) => {
    e.target.disabled = true
    e.target.backgroundColor = "#ccc";
    setTimeout(() => {
      e.target.disabled = false
    }, 500)
    buyFlowerCallback(flower)
  }


  return (
    <div className="flower-card">
      <img
        src={flower.img_link}
        alt={flower.name}
      />
      <h2>{flower.name}</h2>
      <p>Price: {flower.price} uah</p>

      <button onClick={buyCallback}>Buy</button>
    </div>
  );
};

export default FlowerCard;
