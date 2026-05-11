import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import Payment from "../models/Payment.js";
import { resend } from "../server.js";

const router = express.Router();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ===============================
// Create Order Route
// ===============================
router.post("/create-order", async (req, res) => {
  try {
    const { bookId, title, amount, name, email, mobile, address, pincode } = req.body;

    // Validate input
    if (!bookId || !title || !amount) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: bookId, title, amount",
      });
    }

    // Validate user details
    if (!name || !email || !mobile || !address || !pincode) {
      return res.status(400).json({
        success: false,
        message: "Missing required user details: name, email, mobile, address, pincode",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // Validate mobile number (10 digits)
    if (!/^[0-9]{10}$/.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: "Mobile number must be exactly 10 digits",
      });
    }

    // Validate pincode (6 digits)
    if (!/^[0-9]{6}$/.test(pincode)) {
      return res.status(400).json({
        success: false,
        message: "Pincode must be exactly 6 digits",
      });
    }

    // Safe amount validation
    const rupees = Number(amount);
    
    if (!rupees || rupees < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount. Amount must be at least ₹1",
      });
    }
    
    const amountInPaise = rupees * 100;

    // Check if Razorpay credentials are valid
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({
        success: false,
        message: "Razorpay credentials not configured",
        debug: "Please add valid RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env file",
      });
    }

    // Clean customer data for risk check bypass
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanMobile = mobile.trim();
    
    // Create Razorpay order (removed invalid customer object)
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      notes: {
        bookId,
        title,
        customer_name: cleanName,
        customer_email: cleanEmail,
        customer_mobile: cleanMobile,
      },
    });

    // Save initial payment record with pending status
    const payment = new Payment({
      name: cleanName,
      email: cleanEmail,
      mobile: cleanMobile,
      address: address.trim(),
      pincode: pincode.trim(),
      bookId,
      bookTitle: title,
      amount: parseInt(amount),
      razorpay_order_id: order.id,
      receipt: order.receipt,
      status: "pending",
    });

    await payment.save();

    res.json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
      payment_id: payment._id, // Include payment record ID
    });
  } catch (error) {
    console.error("Error creating order:", error);
    
    // If it's an authentication error, provide helpful message
    if (error.statusCode === 401) {
      return res.status(500).json({
        success: false,
        message: "Razorpay authentication failed",
        debug: "Please check your RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env file",
        error: error.error?.description || error.message,
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message,
    });
  }
});

// ===============================
// Verify Payment Route
// ===============================
router.post("/verify-payment", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      payment_record_id, // The ID of the payment record from database
    } = req.body;

    // Validate input
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing required payment verification fields",
      });
    }

    // Generate signature
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    // Find the payment record
    const paymentRecord = await Payment.findById(payment_record_id);
    if (!paymentRecord) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found",
      });
    }

    // Verify signature
    if (generated_signature === razorpay_signature) {
      // Payment is successful - update database
      paymentRecord.razorpay_payment_id = razorpay_payment_id;
      paymentRecord.razorpay_signature = razorpay_signature;
      paymentRecord.status = "success";
      await paymentRecord.save();

      // Decrease book quantity
      try {
        const bookResponse = await fetch(`${req.protocol}://${req.get('host')}/api/books/internal/decrease-quantity/${paymentRecord.bookId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            quantity: 1 // Decrease by 1 for each order
          }),
        });
        
        if (bookResponse.ok) {
          console.log(`📚 Book quantity decreased for ${paymentRecord.bookTitle}`);
        } else {
          console.error(`❌ Failed to decrease book quantity for ${paymentRecord.bookTitle}`);
        }
      } catch (bookError) {
        console.error("Error decreasing book quantity:", bookError);
      }

      console.log("Payment verified successfully:", {
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id,
        transaction_id: paymentRecord._id,
        email: paymentRecord.email,
        bookTitle: paymentRecord.bookTitle,
      });

      res.json({
        success: true,
        message: "Payment verified successfully",
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id,
        transaction_id: paymentRecord._id,
        user_details: {
          name: paymentRecord.name,
          email: paymentRecord.email,
          mobile: paymentRecord.mobile,
          address: paymentRecord.address,
          pincode: paymentRecord.pincode,
          bookTitle: paymentRecord.bookTitle,
          amount: paymentRecord.amount,
        }
      });

      // Send success emails (admin + customer)
      try {
        await fetch(`${req.protocol}://${req.get('host')}/api/send-book-purchase-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            transaction_id: paymentRecord._id,
            order_id: razorpay_order_id,
            payment_id: razorpay_payment_id,
            status: "success",
            name: paymentRecord.name,
            email: paymentRecord.email,
            mobile: paymentRecord.mobile,
            address: paymentRecord.address,
            pincode: paymentRecord.pincode,
            bookTitle: paymentRecord.bookTitle,
            amount: paymentRecord.amount,
          }),
        });
      } catch (emailError) {
        console.error("Failed to send success emails:", emailError);
      }
    } else {
      // Signature mismatch - mark as failed
      paymentRecord.razorpay_payment_id = razorpay_payment_id;
      paymentRecord.razorpay_signature = razorpay_signature;
      paymentRecord.status = "failed";
      await paymentRecord.save();

      console.log("Payment verification failed:", {
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id,
        transaction_id: paymentRecord._id,
        reason: "Signature mismatch"
      });

      res.status(400).json({
        success: false,
        message: "Payment verification failed - signature mismatch",
        transaction_id: paymentRecord._id,
        order_id: razorpay_order_id,
      });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify payment",
      error: error.message,
    });
  }
});

// ===============================
// Handle Failed Payment Route
// ===============================
// ===============================
// Send Book Purchase Email Route
// ===============================
router.post("/send-book-purchase-email", async (req, res) => {
  const {
    transaction_id,
    order_id,
    payment_id,
    status,
    name,
    email,
    mobile,
    address,
    pincode,
    bookTitle,
    amount,
    error_description
  } = req.body;

  try {
    // Send email to admin
    const adminEmailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a2340;">Book Purchase ${status.charAt(0).toUpperCase() + status.slice(1)}</h2>
        
        <h3>📚 Book Purchase Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Book Title:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${bookTitle}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Amount:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">₹${amount}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Transaction ID:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${transaction_id}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Order ID:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${order_id}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Payment ID:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${payment_id || 'N/A'}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Status:</strong></td><td style="padding: 8px; border: 1px solid #ddd; color: ${status === 'success' ? '#28a745' : '#dc3545'}; font-weight: bold;">${status.charAt(0).toUpperCase() + status.slice(1)}</td></tr>
          ${error_description ? `<tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Error:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${error_description}</td></tr>` : ''}
        </table>
        
        <h3>👤 Customer Information</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Name:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${name}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Email:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${email}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Mobile:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${mobile}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Address:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${address}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Pincode:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${pincode}</td></tr>
        </table>
        
        <hr style="margin: 30px 0;">
        <p style="color: #6c757d; font-size: 14px;">
          This is an automated email from Sachin Bansal's Book Store.<br>
          Timestamp: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
        </p>
      </div>
    `;

    await resend.emails.send({
      from: "Book Store Admin <onboarding@resend.dev>",
      to: "anotherdimplekataria@gmail.com",
      subject: `Book Purchase ${status.charAt(0).toUpperCase() + status.slice(1)} - ${bookTitle} - ${name}`,
      html: adminEmailContent,
    });

    // Send email to customer (only if payment successful)
    if (status === 'success') {
      const customerEmailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #28a745;">🎉 Order Confirmed!</h2>
          
          <p>Dear ${name},</p>
          
          <p>Thank you for your purchase! Your payment has been successfully processed and your order has been confirmed.</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>📚 Order Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px;"><strong>Book Title:</strong></td><td style="padding: 8px;">${bookTitle}</td></tr>
              <tr><td style="padding: 8px;"><strong>Amount Paid:</strong></td><td style="padding: 8px;">₹${amount}</td></tr>
              <tr><td style="padding: 8px;"><strong>Transaction ID:</strong></td><td style="padding: 8px;">${transaction_id}</td></tr>
              <tr><td style="padding: 8px;"><strong>Order ID:</strong></td><td style="padding: 8px;">${order_id}</td></tr>
            </table>
          </div>
          
          <div style="background: #d4edda; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4>📦 Delivery Information</h4>
            <p>Your book will be delivered to:</p>
            <p><strong>${name}</strong><br>
            ${address}<br>
            ${pincode}<br>
            📱 ${mobile}</p>
          </div>
          
          <div style="background: #e7f3ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4>📚 About Your Book</h4>
            <p>This is a comprehensive study guide designed to help you excel in your exams. The book includes:</p>
            <ul>
              <li>Clear and concise notes</li>
              <li>Important questions and answers</li>
              <li>Exam-oriented content</li>
              <li>Practice exercises</li>
            </ul>
          </div>
          
          <p>For any queries or support, please feel free to contact us.</p>
          
          <hr style="margin: 30px 0;">
          <p style="color: #6c757d; font-size: 14px;">
            Best regards,<br>
            <strong>Sachin Bansal</strong><br>
            Author & Educator<br>
            <small>This is an automated email. Please do not reply to this email.</small>
          </p>
        </div>
      `;

      await resend.emails.send({
        from: "Sachin Bansal's Book Store <onboarding@resend.dev>",
        to: email,
        subject: `Order Confirmed - ${bookTitle} | Sachin Bansal's Book Store`,
        html: customerEmailContent,
      });
    }

    console.log(`Book purchase emails sent for transaction: ${transaction_id} (Admin: Yes, Customer: ${status === 'success' ? 'Yes' : 'No'})`);
    res.json({ success: true, message: "Emails sent successfully" });
  } catch (error) {
    console.error("Book Purchase Email Error:", error);
    res.status(500).json({ success: false, error: "Failed to send email" });
  }
});

// ===============================
// Send Payment Email Route (Legacy)
// ===============================
router.post("/send-payment-email", async (req, res) => {
  const {
    transaction_id,
    order_id,
    payment_id,
    status,
    name,
    email,
    mobile,
    address,
    pincode,
    bookTitle,
    amount,
    error_description
  } = req.body;

  try {
    const emailContent = `
      <h2>Payment ${status.charAt(0).toUpperCase() + status.slice(1)} Notification</h2>
      
      <h3>📚 Book Purchase Details</h3>
      <p><strong>Book Title:</strong> ${bookTitle}</p>
      <p><strong>Amount:</strong> ₹${amount}</p>
      
      <h3>👤 Customer Information</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Mobile:</strong> ${mobile}</p>
      <p><strong>Address:</strong> ${address}</p>
      <p><strong>Pincode:</strong> ${pincode}</p>
      
      <h3>💳 Payment Details</h3>
      <p><strong>Transaction ID:</strong> ${transaction_id}</p>
      <p><strong>Order ID:</strong> ${order_id}</p>
      <p><strong>Payment ID:</strong> ${payment_id || 'N/A'}</p>
      <p><strong>Status:</strong> ${status.charAt(0).toUpperCase() + status.slice(1)}</p>
      ${error_description ? `<p><strong>Error:</strong> ${error_description}</p>` : ''}
      
      <hr>
      <p><small>This is an automated email from Sachin Bansal's Book Store.</small></p>
    `;

    // Send email to admin
    await resend.emails.send({
      from: "Book Store Payments <onboarding@resend.dev>",
      to: "anotherdimplekataria@gmail.com",
      subject: `Payment ${status.charAt(0).toUpperCase() + status.slice(1)} - ${bookTitle} - ${name}`,
      html: emailContent,
    });

    // Send email to customer
    const customerEmailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${status === 'success' ? '#28a745' : '#dc3545'};">
          Payment ${status.charAt(0).toUpperCase() + status.slice(1)}
        </h2>
        
        <p>Dear ${name},</p>
        
        <p>${status === 'success' 
          ? 'Thank you for your purchase! Your payment has been successfully processed.'
          : 'We regret to inform you that your payment could not be processed.'}</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>📚 Order Details</h3>
          <p><strong>Book Title:</strong> ${bookTitle}</p>
          <p><strong>Amount:</strong> ₹${amount}</p>
          <p><strong>Transaction ID:</strong> ${transaction_id}</p>
          <p><strong>Order ID:</strong> ${order_id}</p>
          <p><strong>Status:</strong> <span style="color: ${status === 'success' ? '#28a745' : '#dc3545'}">${status.charAt(0).toUpperCase() + status.slice(1)}</span></p>
        </div>
        
        ${status === 'success' 
          ? `
          <div style="background: #d4edda; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4>📦 Delivery Information</h4>
            <p>Your book will be delivered to:</p>
            <p><strong>${name}</strong><br>
            ${address}<br>
            ${pincode}</p>
            <p><strong>Mobile:</strong> ${mobile}</p>
          </div>
          
          <p>For any queries, please contact us.</p>
          `
          : `
          <div style="background: #f8d7da; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Payment Issue:</strong> ${error_description || 'Payment could not be completed'}</p>
            <p>If you think this is an error, please try again or contact our support.</p>
          </div>
          `
        }
        
        <hr style="margin: 30px 0;">
        <p style="color: #6c757d; font-size: 14px;">
          Best regards,<br>
          Sachin Bansal's Book Store<br>
          <small>This is an automated email. Please do not reply to this email.</small>
        </p>
      </div>
    `;

    await resend.emails.send({
      from: "Sachin Bansal's Book Store <onboarding@resend.dev>",
      to: email,
      subject: status === 'success' 
        ? `Order Confirmed - ${bookTitle} | Sachin Bansal's Book Store`
        : `Payment Failed - ${bookTitle} | Sachin Bansal's Book Store`,
      html: customerEmailContent,
    });

    console.log(`Payment emails sent for transaction: ${transaction_id} (Admin & Customer)`);
    res.json({ success: true, message: "Emails sent successfully" });
  } catch (error) {
    console.error("Payment Email Error:", error);
    res.status(500).json({ success: false, error: "Failed to send email" });
  }
});

// ===============================
// Handle Failed Payment Route
// ===============================
router.post("/payment-failed", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      payment_record_id,
      error_description = "Payment cancelled by user",
      error_code,
      error_reason
    } = req.body;

    // Find the payment record
    const paymentRecord = await Payment.findById(payment_record_id);
    if (!paymentRecord) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found",
      });
    }

    // Mark as failed and save error details
    paymentRecord.status = "failed";
    if (razorpay_payment_id) {
      paymentRecord.razorpay_payment_id = razorpay_payment_id;
    }
    
    // Store error details in notes or a separate field if needed
    paymentRecord.notes = paymentRecord.notes || {};
    paymentRecord.notes.error_description = error_description;
    paymentRecord.notes.error_code = error_code;
    paymentRecord.notes.error_reason = error_reason;
    
    await paymentRecord.save();

    console.log("Payment failed:", {
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
      transaction_id: paymentRecord._id,
      reason: error_description,
      error_code: error_code,
      error_reason: error_reason
    });

    res.json({
      success: true,
      message: "Payment failure recorded",
      transaction_id: paymentRecord._id,
      order_id: razorpay_order_id,
    });

    // Send failed emails (admin only)
    try {
      await fetch(`${req.protocol}://${req.get('host')}/api/send-book-purchase-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transaction_id: paymentRecord._id,
          order_id: razorpay_order_id,
          payment_id: paymentRecord.razorpay_payment_id,
          status: "failed",
          name: paymentRecord.name,
          email: paymentRecord.email,
          mobile: paymentRecord.mobile,
          address: paymentRecord.address,
          pincode: paymentRecord.pincode,
          bookTitle: paymentRecord.bookTitle,
          amount: paymentRecord.amount,
          error_description: error_description,
        }),
      });
    } catch (emailError) {
      console.error("Failed to send failed emails:", emailError);
    }
  } catch (error) {
    console.error("Error recording payment failure:", error);
    res.status(500).json({
      success: false,
      message: "Failed to record payment failure",
      error: error.message,
    });
  }
});

// ===============================
// Get All Purchased Books (Admin Panel)
// ===============================
router.get("/admin/purchased-books", async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    
    res.json({
      success: true,
      payments: payments.map(payment => ({
        id: payment._id,
        bookTitle: payment.bookTitle,
        amount: payment.amount,
        status: payment.status,
        name: payment.name,
        email: payment.email,
        mobile: payment.mobile,
        address: payment.address,
        pincode: payment.pincode,
        transaction_id: payment._id,
        order_id: payment.razorpay_order_id,
        payment_id: payment.razorpay_payment_id,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
        delivered: payment.delivered || false,
        deliveredAt: payment.deliveredAt,
        adminNotes: payment.adminNotes || []
      }))
    });
  } catch (error) {
    console.error("Error fetching purchased books:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch purchased books",
      error: error.message
    });
  }
});

// ===============================
// Mark Book as Delivered
// ===============================
router.put("/admin/mark-delivered/:paymentId", async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    const payment = await Payment.findById(paymentId);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found"
      });
    }
    
    // Only allow marking as delivered if payment is successful
    if (payment.status !== 'success') {
      return res.status(400).json({
        success: false,
        message: "Can only mark successful payments as delivered"
      });
    }
    
    payment.delivered = true;
    payment.deliveredAt = new Date();
    await payment.save();
    
    // Send delivery confirmation email to customer
    try {
      const deliveryEmailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #28a745;">📦 Book Delivered!</h2>
          
          <p>Dear ${payment.name},</p>
          
          <p>Great news! Your book has been successfully delivered to your address.</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>📚 Delivery Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px;"><strong>Book Title:</strong></td><td style="padding: 8px;">${payment.bookTitle}</td></tr>
              <tr><td style="padding: 8px;"><strong>Delivered To:</strong></td><td style="padding: 8px;">${payment.address}, ${payment.pincode}</td></tr>
              <tr><td style="padding: 8px;"><strong>Delivery Date:</strong></td><td style="padding: 8px;">${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td></tr>
              <tr><td style="padding: 8px;"><strong>Transaction ID:</strong></td><td style="padding: 8px;">${payment._id}</td></tr>
            </table>
          </div>
          
          <div style="background: #d4edda; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4>📚 Enjoy Your Book!</h4>
            <p>We hope you find this study guide helpful for your exam preparation. If you have any questions or need assistance, feel free to reach out to us.</p>
          </div>
          
          <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4>📝 Leave a Review</h4>
            <p>If you found this book helpful, we'd appreciate it if you could leave a review on our website. Your feedback helps other students make informed decisions.</p>
          </div>
          
          <p>Thank you for choosing Sachin Bansal's Book Store!</p>
          
          <hr style="margin: 30px 0;">
          <p style="color: #6c757d; font-size: 14px;">
            Best regards,<br>
            <strong>Sachin Bansal</strong><br>
            Author & Educator<br>
            <small>This is an automated email. Please do not reply to this email.</small>
          </p>
        </div>
      `;

      await resend.emails.send({
        from: "Sachin Bansal's Book Store <onboarding@resend.dev>",
        to: payment.email,
        subject: `Book Delivered - ${payment.bookTitle} | Sachin Bansal's Book Store`,
        html: deliveryEmailContent,
      });

      // Also notify admin
      const adminNotificationContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #28a745;">📦 Book Marked as Delivered</h2>
          
          <p>The following book has been marked as delivered:</p>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Book Title:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${payment.bookTitle}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Customer:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${payment.name}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Email:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${payment.email}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Mobile:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${payment.mobile}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Transaction ID:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${payment._id}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Delivered On:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td></tr>
          </table>
        </div>
      `;

      await resend.emails.send({
        from: "Book Store Admin <onboarding@resend.dev>",
        to: "anotherdimplekataria@gmail.com",
        subject: `Book Delivered - ${payment.bookTitle} - ${payment.name}`,
        html: adminNotificationContent,
      });

    } catch (emailError) {
      console.error("Failed to send delivery emails:", emailError);
    }
    
    res.json({
      success: true,
      message: "Book marked as delivered successfully",
      deliveredAt: payment.deliveredAt
    });
    
  } catch (error) {
    console.error("Error marking book as delivered:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark book as delivered",
      error: error.message
    });
  }
});

// ===============================
// Add Note to Order
// ===============================
router.post("/admin/add-note/:paymentId", async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { text } = req.body;
    
    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Note text is required"
      });
    }
    
    const payment = await Payment.findById(paymentId);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found"
      });
    }
    
    const newNote = {
      text: text.trim(),
      timestamp: new Date(),
      id: Date.now()
    };
    
    payment.adminNotes.push(newNote);
    await payment.save();
    
    res.json({
      success: true,
      message: "Note added successfully",
      note: newNote
    });
    
  } catch (error) {
    console.error("Error adding note:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add note",
      error: error.message
    });
  }
});

// ===============================
// Delete Note from Order
// ===============================
router.delete("/admin/delete-note/:paymentId/:noteId", async (req, res) => {
  try {
    const { paymentId, noteId } = req.params;
    
    const payment = await Payment.findById(paymentId);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found"
      });
    }
    
    payment.adminNotes = payment.adminNotes.filter(note => note.id !== parseInt(noteId));
    await payment.save();
    
    res.json({
      success: true,
      message: "Note deleted successfully"
    });
    
  } catch (error) {
    console.error("Error deleting note:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete note",
      error: error.message
    });
  }
});

// ===============================
// Razorpay Webhook Payment Success Handler
// ===============================
router.post("/payment-success", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      payment_record_id
    } = req.body;

    // Validate input
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing required payment verification fields"
      });
    }

    // Generate signature for verification
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    // Find the payment record
    const paymentRecord = await Payment.findById(payment_record_id);
    if (!paymentRecord) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found"
      });
    }

    // Verify signature
    if (generated_signature !== razorpay_signature) {
      // Update payment record as failed
      paymentRecord.razorpay_payment_id = razorpay_payment_id;
      paymentRecord.razorpay_signature = razorpay_signature;
      paymentRecord.status = "failed";
      paymentRecord.notes = {
        ...paymentRecord.notes,
        error_description: "Webhook signature verification failed",
        error_reason: "Invalid signature"
      };
      await paymentRecord.save();

      return res.status(400).json({
        success: false,
        message: "Payment verification failed - signature mismatch",
        transaction_id: paymentRecord._id
      });
    }

    // Check if payment is already processed
    if (paymentRecord.status === "success") {
      return res.json({
        success: true,
        message: "Payment already processed",
        transaction_id: paymentRecord._id
      });
    }

    // Update payment record as successful
    paymentRecord.razorpay_payment_id = razorpay_payment_id;
    paymentRecord.razorpay_signature = razorpay_signature;
    paymentRecord.status = "success";
    await paymentRecord.save();

    // Decrease book quantity
    try {
      const bookResponse = await fetch(`${req.protocol}://${req.get('host')}/api/books/internal/decrease-quantity/${paymentRecord.bookId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quantity: 1 // Decrease by 1 for each order
        }),
      });
      
      if (bookResponse.ok) {
        console.log(`📚 Book quantity decreased for ${paymentRecord.bookTitle}`);
      } else {
        console.error(`❌ Failed to decrease book quantity for ${paymentRecord.bookTitle}`);
      }
    } catch (bookError) {
      console.error("Error decreasing book quantity:", bookError);
    }

    console.log("Payment success webhook processed:", {
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
      transaction_id: paymentRecord._id,
      email: paymentRecord.email,
      bookTitle: paymentRecord.bookTitle
    });

    // Send comprehensive emails with book details
    try {
      await sendPaymentSuccessEmails(paymentRecord, req);
    } catch (emailError) {
      console.error("Failed to send payment success emails:", emailError);
      // Don't fail the response if emails fail
    }

    res.json({
      success: true,
      message: "Payment processed successfully",
      transaction_id: paymentRecord._id,
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
      book_details: {
        title: paymentRecord.bookTitle,
        amount: paymentRecord.amount,
        customer_name: paymentRecord.name,
        customer_email: paymentRecord.email
      }
    });

  } catch (error) {
    console.error("Error processing payment success webhook:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process payment success",
      error: error.message
    });
  }
});

// ===============================
// Helper Function: Send Payment Success Emails
// ===============================
async function sendPaymentSuccessEmails(paymentRecord, req) {
  const { _id, name, email, mobile, address, pincode, bookTitle, amount, razorpay_order_id, razorpay_payment_id } = paymentRecord;

  // Send email to admin with full book details
  const adminEmailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto;">
      <h2 style="color: #28a745;">🎉 New Book Order - Payment Successful!</h2>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>📚 Book Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Book Title:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${bookTitle}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Price:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">₹${amount}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Book ID:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${paymentRecord.bookId}</td></tr>
        </table>
      </div>
      
      <div style="background: #e7f3ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>👤 Customer Information</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Name:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${name}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Email:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${email}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Mobile:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${mobile}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Address:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${address}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Pincode:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${pincode}</td></tr>
        </table>
      </div>
      
      <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>💳 Payment Information</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Transaction ID:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${_id}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Order ID:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${razorpay_order_id}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Payment ID:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${razorpay_payment_id}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Payment Date:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td></tr>
        </table>
      </div>
      
      <div style="background: #d4edda; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h4>📦 Next Steps</h4>
        <p>Please process this order for delivery. You can mark it as delivered from the admin panel once the book reaches the customer.</p>
      </div>
      
      <hr style="margin: 30px 0;">
      <p style="color: #6c757d; font-size: 14px;">
        This is an automated notification from Sachin Bansal's Book Store.<br>
        Timestamp: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
      </p>
    </div>
  `;

  await resend.emails.send({
    from: "Book Store Orders <onboarding@resend.dev>",
    to: "anotherdimplekataria@gmail.com",
    subject: `🎉 New Order - ${bookTitle} - ${name}`,
    html: adminEmailContent,
  });

  // Send detailed email to customer
  const customerEmailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #28a745;">🎉 Order Confirmed!</h2>
      
      <p>Dear <strong>${name}</strong>,</p>
      
      <p>Thank you for your purchase! Your payment has been successfully processed and your order has been confirmed. We're excited to help you on your learning journey!</p>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>📚 Your Order Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px;"><strong>Book Title:</strong></td><td style="padding: 8px;">${bookTitle}</td></tr>
          <tr><td style="padding: 8px;"><strong>Amount Paid:</strong></td><td style="padding: 8px;">₹${amount}</td></tr>
          <tr><td style="padding: 8px;"><strong>Transaction ID:</strong></td><td style="padding: 8px;">${_id}</td></tr>
          <tr><td style="padding: 8px;"><strong>Order ID:</strong></td><td style="padding: 8px;">${razorpay_order_id}</td></tr>
          <tr><td style="padding: 8px;"><strong>Payment ID:</strong></td><td style="padding: 8px;">${razorpay_payment_id}</td></tr>
        </table>
      </div>
      
      <div style="background: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h4>📦 Delivery Information</h4>
        <p>Your book will be delivered to:</p>
        <div style="background: white; padding: 15px; border-radius: 5px; margin: 10px 0;">
          <p><strong>${name}</strong><br>
          ${address}<br>
          ${pincode}<br>
          📱 ${mobile}</p>
        </div>
        <p><em>Expected delivery: 3-7 business days</em></p>
      </div>
      
      <div style="background: #e7f3ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h4>📚 About Your Book</h4>
        <p><strong>${bookTitle}</strong> is a comprehensive study guide designed to help you excel in your exams. This book includes:</p>
        <ul>
          <li>✅ Clear and concise explanations</li>
          <li>✅ Important questions and answers</li>
          <li>✅ Exam-oriented content</li>
          <li>✅ Practice exercises and examples</li>
          <li>✅ Previous year solved papers</li>
        </ul>
      </div>
      
      <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h4>📧 What's Next?</h4>
        <p>You will receive:</p>
        <ol>
          <li>Order confirmation (this email)</li>
          <li>Shipping confirmation with tracking details</li>
          <li>Delivery confirmation email</li>
        </ol>
      </div>
      
      <p>For any queries or support, please feel free to contact us. We're here to help!</p>
      
      <hr style="margin: 30px 0;">
      <p style="color: #6c757d; font-size: 14px;">
        Best regards,<br>
        <strong>Sachin Bansal</strong><br>
        Author & Educator<br>
        <small>This is an automated email. Please do not reply to this email.</small>
      </p>
    </div>
  `;

  await resend.emails.send({
    from: "Sachin Bansal's Book Store <onboarding@resend.dev>",
    to: email,
    subject: `🎉 Order Confirmed - ${bookTitle} | Sachin Bansal's Book Store`,
    html: customerEmailContent,
  });

  console.log(`Payment success emails sent for transaction: ${_id} (Admin: Yes, Customer: Yes)`);
}

export default router;
