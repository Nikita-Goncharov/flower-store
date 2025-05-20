import React from "react";
import FlowerCard from "./FlowerCard";

const FlowerList = ({ flowers, buyFlowerCallback, gridCount = 4 }) => {
  console.log(gridCount)
  let width;
  switch (gridCount) {
    case 1:
      width = "33%"
      break
    case 2:
      width = "66%"
      break
    default:
      width = "100%"
      break
  }
  
  return (
    <div className="flower-list" style={{"width": width, "gridTemplateColumns": `repeat(${gridCount}, 1fr)`}}>
      {flowers.map((flower) => (
        <FlowerCard
          key={flower.id}
          flower={flower}
          buyFlowerCallback={buyFlowerCallback}
        />
      ))}
    </div>
  );
};

export default FlowerList;
