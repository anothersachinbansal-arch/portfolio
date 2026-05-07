import React, { useState } from "react";
import "./PaymentForm.css";

const PaymentForm = ({ book, onFormSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    address: "",
    pincode: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
    } else if (!/^[0-9]{10}$/.test(formData.mobile)) {
      newErrors.mobile = "Mobile number must be exactly 10 digits";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^[0-9]{6}$/.test(formData.pincode)) {
      newErrors.pincode = "Pincode must be exactly 6 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onFormSubmit(formData);
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="payment-form-overlay">
      <div className="payment-form-container">
        <div className="payment-form-header">
          <h2>Complete Your Purchase</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="book-summary">
          <div className="book-info">
            <h3>{book.title}</h3>
            <p className="book-price">₹{book.price}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="payment-form">
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className={errors.name ? "error" : ""}
              disabled={isSubmitting}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email address"
              className={errors.email ? "error" : ""}
              disabled={isSubmitting}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="mobile">Mobile Number *</label>
            <input
              type="tel"
              id="mobile"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              placeholder="Enter 10-digit mobile number"
              maxLength={10}
              className={errors.mobile ? "error" : ""}
              disabled={isSubmitting}
            />
            {errors.mobile && <span className="error-message">{errors.mobile}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="address">Delivery Address *</label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter your complete delivery address"
              rows={3}
              className={errors.address ? "error" : ""}
              disabled={isSubmitting}
            />
            {errors.address && <span className="error-message">{errors.address}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="pincode">Pincode *</label>
            <input
              type="text"
              id="pincode"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              placeholder="Enter 6-digit pincode"
              maxLength={6}
              className={errors.pincode ? "error" : ""}
              disabled={isSubmitting}
            />
            {errors.pincode && <span className="error-message">{errors.pincode}</span>}
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="proceed-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : "Proceed to Payment"}
            </button>
          </div>
        </form>

        <div className="security-note">
          <p>
            <i className="fas fa-lock"></i>
            Your payment information is secure and encrypted
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;
