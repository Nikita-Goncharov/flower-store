import Modal from 'react-modal';
import React, { useState, useEffect } from "react";
import FlowerList from "../components/FlowerList";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchFlowers } from "../redux/slices/flowersSlice";
import { createOrder } from "../redux/slices/ordersSlice";
import "../design/Catalog.css";

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    width: '80%',
    maxHeight: '80vh',
    overflowY: 'auto',
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    transform: 'translate(-50%, -50%)',
  },
};

Modal.setAppElement('#root');

const Catalog = ({ cartItems, setCartItems }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortedFlowers, setSortedFlowers] = useState([]);
  const [modalIsOpen, setIsOpen] = useState(false);
  const [recommendedFlowers, setRecommendedFlowers] = useState([]);
  const [selectedFlower, setSelectedFlower] = useState(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { items: allFlowers, status } = useSelector((state) => state.flowers);

  useEffect(() => {
    dispatch(fetchFlowers());
  }, [dispatch]);

  useEffect(() => {
    setSortedFlowers(allFlowers);
  }, [allFlowers]);

  function shuffle(array) {
    let currentIndex = array.length;
  
    // While there remain elements to shuffle...
    while (currentIndex !== 0) {
  
      // Pick a remaining element...
      let randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  }

  const createFlowerOrder = async (flower) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const existingItem = cartItems.find((item) => item.id === flower.id);
    if (existingItem) {
      setCartItems(
        cartItems.map((item) =>
          item.id === flower.id
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
          price: flower.price,
          quantity: 1,
          image: flower.img_link,
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

      if (!result.success) {
        alert("Failed to create order: " + result.message);
      }
    } catch (err) {
      alert("Error creating order: " + err);
    }
  };

  const handleAddToCartAndCreateOrder = async (flower) => {
    await createFlowerOrder(flower);

    setSelectedFlower(flower);
    const sameCategoryFlowers = allFlowers.filter(
      (f) => f.category === flower.category && f.id !== flower.id
    );
    
    if (sameCategoryFlowers.length) {
      shuffle(sameCategoryFlowers)
      setRecommendedFlowers(sameCategoryFlowers.slice(0, 4));  // three random flowers
      setIsOpen(true);
    } else {
      navigate("/orders")
    }
  };

  const closeModal = () => {
    setIsOpen(false);
    setRecommendedFlowers([]);
    setSelectedFlower(null);
    navigate("/orders")
  };

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
          placeholder="Search..."
          value={searchQuery}
          onChange={handleSearch}
        />
        <div className="sort-buttons">
          <button onClick={sortAscending}>Growth (by price)</button>
          <button onClick={sortDescending}>Decline (by price)</button>
        </div>
      </div>

      {status === "flowers-loading" && <p>Loading flowers...</p>}
      {status === "flowers-failed" && <p>Error loading flowers.</p>}

      {status === "succeeded" && (
        <>
          <Modal
            isOpen={modalIsOpen}
            onRequestClose={closeModal}
            style={customStyles}
          >
            <h2>Recommendations based on: {selectedFlower?.name}</h2>
            <FlowerList
                flowers={recommendedFlowers}
                buyFlowerCallback={createFlowerOrder}
                gridCount={recommendedFlowers.length >= 3 ? 3 : recommendedFlowers.length}
              />
            <div className="modal-end-purchase-div">
              <button className="modal-end-purchase" onClick={closeModal}>End purchase</button>
            </div>
          </Modal>
          {sortedFlowers.length ? <FlowerList
            flowers={sortedFlowers}
            buyFlowerCallback={handleAddToCartAndCreateOrder}
          /> : <p className="flowers-loading">There are no flowers yet</p>}
        </>
      )}
    </div>
  );
};

export default Catalog;
