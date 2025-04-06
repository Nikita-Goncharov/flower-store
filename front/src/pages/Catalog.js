// src/pages/Catalog.js

import React, { useState, useEffect } from "react";
import FlowerList from "../components/FlowerList";
import { useDispatch, useSelector } from "react-redux";
import { fetchFlowers } from "../redux/slices/flowersSlice";
import "../design/Catalog.css";

const Catalog = ({ cartItems, setCartItems }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortedFlowers, setSortedFlowers] = useState([]);
  
  const dispatch = useDispatch();
  const { items: allFlowers, status } = useSelector((state) => state.flowers);

  useEffect(() => {
    dispatch(fetchFlowers());
  }, [dispatch]);

  // Коли квіти завантажились
  useEffect(() => {
    setSortedFlowers(allFlowers);
  }, [allFlowers]);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    if (query === "") {
      setSortedFlowers(allFlowers);
    } else {
      filterAndSortFlowers(query, allFlowers);
    }
  };

  const sortAscending = () => {
    setSortedFlowers((prev) => [...prev].sort((a, b) => a.price - b.price));
  };

  const sortDescending = () => {
    setSortedFlowers((prev) => [...prev].sort((a, b) => b.price - a.price));
  };

  const filterAndSortFlowers = (query, flowersList) => {
    const filtered = flowersList.filter((flower) =>
      flower.name.toLowerCase().includes(query)
    );
    setSortedFlowers(filtered);
  };

  return (
    <div className="catalog">
      <div className="controls">
        <input
          type="text"
          placeholder="Пошук..."
          value={searchQuery}
          onChange={handleSearch}
        />
        <div className="sort-buttons">
          <button onClick={sortAscending}>Зростання (за ціною)</button>
          <button onClick={sortDescending}>Спадання (за ціною)</button>
        </div>
      </div>

      {status === "loading" && <p>Завантаження квітів...</p>}
      {status === "failed" && <p>Помилка завантаження квітів.</p>}
      
      {status === "succeeded" && (
        <FlowerList
          flowers={sortedFlowers}
          cartItems={cartItems}
          setCartItems={setCartItems}
        />
      )}
    </div>
  );
};

export default Catalog;
