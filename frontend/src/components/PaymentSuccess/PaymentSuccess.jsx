import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./PaymentSuccess.css";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [transactionDetails, setTransactionDetails] = useState(null);

  useEffect(() => {
    // Get transaction details from URL parameters
    const details = {
      transaction_id: searchParams.get("transaction_id"),
      order_id: searchParams.get("order_id"),
      name: searchParams.get("name"),
      email: searchParams.get("email"),
      mobile: searchParams.get("mobile"),
      address: searchParams.get("address"),
      pincode: searchParams.get("pincode"),
      book: searchParams.get("book"),
      amount: searchParams.get("amount"),
    };
    setTransactionDetails(details);
  }, [searchParams]);

  const handleBackToHome = () => {
    navigate("/");
  };

  const handleViewBooks = () => {
    navigate("/books");
  };

  return (
    <section className="payment-success-section">
      <div className="payment-success-container">
        <div className="success-animation">
          <div className="success-checkmark">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="#4CAF50" strokeWidth="2"/>
              <path d="M8 12l2 2 4-4" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        <h1 className="success-title">Payment Successful!</h1>
        <p className="success-message">
          Thank you for your purchase! Your order has been confirmed.
        </p>

        <div className="order-details">
          <h3>Order Details</h3>
          {transactionDetails ? (
            <>
              <div className="detail-item">
                <span className="label">Transaction ID:</span>
                <span className="value">{transactionDetails.transaction_id}</span>
              </div>
              <div className="detail-item">
                <span className="label">Order ID:</span>
                <span className="value">{transactionDetails.order_id}</span>
              </div>
              <div className="detail-item">
                <span className="label">Customer Name:</span>
                <span className="value">{transactionDetails.name}</span>
              </div>
              <div className="detail-item">
                <span className="label">Email:</span>
                <span className="value">{transactionDetails.email}</span>
              </div>
              <div className="detail-item">
                <span className="label">Mobile:</span>
                <span className="value">{transactionDetails.mobile}</span>
              </div>
              <div className="detail-item">
                <span className="label">Delivery Address:</span>
                <span className="value">{transactionDetails.address}</span>
              </div>
              <div className="detail-item">
                <span className="label">Pincode:</span>
                <span className="value">{transactionDetails.pincode}</span>
              </div>
              <div className="detail-item">
                <span className="label">Book:</span>
                <span className="value">{transactionDetails.book}</span>
              </div>
              <div className="detail-item">
                <span className="label">Amount Paid:</span>
                <span className="value">₹{transactionDetails.amount}</span>
              </div>
              <div className="detail-item">
                <span className="label">Status:</span>
                <span className="value success">Payment Successful</span>
              </div>
              <div className="detail-item">
                <span className="label">Delivery:</span>
                <span className="value">5-7 business days</span>
              </div>
            </>
          ) : (
            <div className="detail-item">
              <span className="value">Loading transaction details...</span>
            </div>
          )}
        </div>

        <div className="next-steps">
          <h3>What's Next?</h3>
          <ul>
            <li>You will receive an order confirmation email shortly</li>
            <li>Our team will process your order within 24 hours</li>
            <li>You will receive tracking details once shipped</li>
            <li>For any queries, contact: support@thesachinbansal.in</li>
          </ul>
        </div>

        <div className="action-buttons">
          <button className="btn-primary" onClick={handleViewBooks}>
            Browse More Books
          </button>
          <button className="btn-secondary" onClick={handleBackToHome}>
            Back to Home
          </button>
        </div>
      </div>
    </section>
  );
};

export default PaymentSuccess;
