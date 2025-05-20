import React from "react";
import { Link } from "react-router-dom";
import "../design/PurchaseFailed.css";

function PaymentFailed() {
  return (
    <div className="payment-failed-container">
      <h1 className="failed-title">❌ Payment failed.</h1>
      <p className="failed-message">
      Something went wrong. Please try again or contact support.
      </p>
      <Link to="/orders" className="retry-link">Return to orders</Link>
    </div>
  );
}

export default PaymentFailed;
