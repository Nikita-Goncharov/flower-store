import React from "react";
import { Link } from "react-router-dom";
import "../design/PurchaseSuccess.css";

function PaymentSuccess() {
  return (
    <div className="payment-success-container">
      <h1 className="success-title">✅ Payment was successful.!</h1>
      <p className="success-message">
      Thank you for your order. We are already preparing the delivery of flowers 🌸
      </p>
      <Link to="/" className="home-link">On the main page</Link>
    </div>
  );
}

export default PaymentSuccess;
