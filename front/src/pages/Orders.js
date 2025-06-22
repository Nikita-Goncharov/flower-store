import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders, changeOrderQuantity, deleteOrder, updateOrdersStatus } from "../redux/slices/ordersSlice";
import { useNavigate } from "react-router-dom";
import {HmacMD5} from "crypto-js"
import Wayforpay from "../wayforpay"
import "../design/Orders.css";
import api from "../api";

function Orders() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, token } = useSelector((state) => state.auth);
  const { list, status, error } = useSelector((state) => state.orders);
  const ordersHistory = list.filter(order => order.status !== "Pending")
  const pendingOrders = list.filter(order => order.status === "Pending")
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    dispatch(fetchOrders());
  }, [dispatch, navigate, isAuthenticated]);

  const productName = []
  const productPrice = []
  const productCount = []
  const orderIds = []
  pendingOrders.forEach((order) => {
    productName.push(order.flower.name)
    productPrice.push(order.amount)
    productCount.push(order.quantity)
    orderIds.push(order.id)
  })
  const amount = productPrice.reduce((a, b) => a + b, 0)

  const pay = () => {
    let response;
    const wayforpay = new Wayforpay();
    const orderDate = Date.now()
    const orderDateSeconds = Math.floor(orderDate / 1000)
    const randomStr = Math.random().toString(36).substring(2, 10);
    const orderReference = `DH${token}-${orderDateSeconds}-${randomStr}`
    const currency = "UAH"
    const signatureString = `${process.env.REACT_APP_MERCHANT_ACCOUNT};${process.env.REACT_APP_MERCHANT_DOMAIN_NAME};${orderReference};${orderDate};${amount};${currency};${productName.join(";")};${productCount.join(";")};${productPrice.join(";")}`
    const signature = HmacMD5(signatureString, process.env.REACT_APP_MERCHANT_ACCOUNT_SECRET)
    wayforpay.run({
        merchantAccount : process.env.REACT_APP_MERCHANT_ACCOUNT,
        merchantDomainName : process.env.REACT_APP_MERCHANT_DOMAIN_NAME,
        merchantSignature : signature,
        orderReference : orderReference,
        orderDate : orderDate,
        amount : amount,
        currency : currency,
        productName : productName,
        productPrice : productPrice,
        productCount : productCount,
        language: "EN",
    },
    async (response) => {
        console.log(`Payment successful: ${response}`)
        await dispatch(updateOrdersStatus({ orderIds, status: "Completed" }))
        navigate("/successful")
    },
    async (response) => {
      console.log(`Payment failed: ${response}`)
      await dispatch(updateOrdersStatus({ orderIds, status: "Failed" }))
      navigate("/failed")
    }
    );
  }

  if (!isAuthenticated) {
    return <p className="orders-error">Please log in..</p>;
  }

  return (
    <div className="orders-container">
      <section className="order-list">
        <h2 className="orders-heading">Waiting for payment</h2>
        {status === "loading" && <p className="orders-loading">Loading...</p>}
        {error && <p className="orders-error">Error: {error}</p>}
        {pendingOrders.length === 0 && status === "succeeded" && (
          <p className="orders-loading">There are no orders yet.</p>
        )}
        {pendingOrders.length !== 0 && <h2 className="amount">Amount: {amount}</h2>}
        <ul>
          {pendingOrders.map((order) => (
            <li key={order.id} className="order-item">
              <img src={order.flower.img_link} alt="Flower img"/>
              <div>
                <p><strong>Status:</strong> {order.status}</p>
                <p>
                  <strong>Flower:</strong> {order.flower.name}<br/>
                  <strong>Price:</strong> {order.amount} uah<br/>
                  <strong>Type:</strong> {order.flower.type}<br/>
                  <strong>Category:</strong> {order.flower.category}<br/>
                </p>
                <div className="order-manage-menu">
                  <div className="quantity-menu">
                    <button onClick={() => {
                      dispatch(changeOrderQuantity({
                        orderId: order.id,
                        quantity: Math.max(1, order.quantity - 1)
                      }))
                      }}>-</button>
                    <p>{order.quantity}</p>
                    <button onClick={() => {
                      dispatch(changeOrderQuantity({
                        orderId: order.id,
                        quantity: order.quantity + 1
                      }))
                      }}>+</button>
                  </div>
                  <button className="delete-order-btn" onClick={() => dispatch(deleteOrder(order.id))}>Delete</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        {pendingOrders.length !== 0 && <button className="wayforpay-button" type="button" onClick={pay}><span>Pay</span></button>}
      </section>
      <nav className="order-history-list">
        <h2 className="orders-heading">Orders history</h2>
        {status === "loading" && <p className="orders-loading">Loading...</p>}
        {error && <p className="orders-error">Error: {error}</p>}
        {ordersHistory.length === 0 && status === "succeeded" && (
          <p className="orders-loading">There are no orders in history yet.</p>
        )}
        <ul>
          {ordersHistory.map((order) => (
            <li key={order.id} className="order-history-item">
              <img src={order.flower.img_link} alt="Flower img"/>
              <div>
                <p><strong>Status:</strong> {order.status}</p>
                <p>
                  <strong>Flower:</strong> {order.flower.name}<br/>
                  <strong>Price:</strong> {order.amount} uah<br/>
                  <strong>Type:</strong> {order.flower.type}<br/>
                  <strong>Category:</strong> {order.flower.category}<br/>
                </p>
                <p><strong>Quantity:</strong> {order.quantity}</p>
              </div>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

export default Orders;
