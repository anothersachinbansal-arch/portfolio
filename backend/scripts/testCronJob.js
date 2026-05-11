import mongoose from "mongoose";
import dotenv from "dotenv";
import Payment from "../models/Payment.js";
import { Resend } from "resend";

dotenv.config();

const resend = new Resend(process.env.RESEND_API);

async function testCronJob() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🔗 Connected to database");

    console.log('🔄 Testing cron job logic...');
    
    // Check for orders that need confirmation email (status: success, orderedEmail: false)
    const pendingOrderEmails = await Payment.find({
      status: 'success',
      orderedEmail: false
    });
    
    console.log(`📧 Found ${pendingOrderEmails.length} orders needing confirmation emails`);
    
    for (const payment of pendingOrderEmails) {
      try {
        console.log(`🔄 Processing payment: ${payment._id} for ${payment.email}`);
        
        await sendOrderConfirmationEmail(payment);
        payment.orderedEmail = true;
        await payment.save();
        
        console.log(`✅ Order confirmation email sent to ${payment.email} for transaction ${payment._id}`);
      } catch (emailError) {
        console.error(`❌ Failed to send order email to ${payment.email}:`, emailError);
      }
    }
    
    // Check for delivered orders that need delivery email (delivered: true, deliveredEmail: false)
    const pendingDeliveryEmails = await Payment.find({
      delivered: true,
      deliveredEmail: false
    });
    
    console.log(`📦 Found ${pendingDeliveryEmails.length} delivered orders needing delivery emails`);
    
    for (const payment of pendingDeliveryEmails) {
      try {
        console.log(`🔄 Processing delivery for: ${payment._id} for ${payment.email}`);
        
        await sendDeliveryConfirmationEmail(payment);
        payment.deliveredEmail = true;
        await payment.save();
        
        console.log(`✅ Delivery confirmation email sent to ${payment.email} for transaction ${payment._id}`);
      } catch (emailError) {
        console.error(`❌ Failed to send delivery email to ${payment.email}:`, emailError);
      }
    }
    
    if (pendingOrderEmails.length === 0 && pendingDeliveryEmails.length === 0) {
      console.log('📧 No pending emails to send');
    }
    
    // Let's also check all payments to see their status
    const allPayments = await Payment.find({});
    console.log(`📊 Total payments in database: ${allPayments.length}`);
    
    for (const payment of allPayments) {
      console.log(`📋 Payment: ${payment._id} | Status: ${payment.status} | Email: ${payment.email} | OrderedEmail: ${payment.orderedEmail} | Delivered: ${payment.delivered} | DeliveredEmail: ${payment.deliveredEmail}`);
    }
    
    console.log("🎉 Cron job test completed!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Script error:", error);
    process.exit(1);
  }
}

async function sendOrderConfirmationEmail(payment) {
  const { _id, name, email, mobile, address, pincode, bookTitle, amount, razorpay_order_id, razorpay_payment_id } = payment;
  
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
          <tr><td style="padding: 8px;"><strong>Payment ID:</strong></td><td style="padding: 8px;">${razorpay_payment_id || 'N/A'}</td></tr>
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
}

async function sendDeliveryConfirmationEmail(payment) {
  const { _id, name, email, address, pincode, bookTitle } = payment;
  
  const deliveryEmailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #28a745;">📦 Book Delivered!</h2>
      
      <p>Dear <strong>${name}</strong>,</p>
      
      <p>Great news! Your book has been successfully delivered to your address.</p>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>📚 Delivery Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px;"><strong>Book Title:</strong></td><td style="padding: 8px;">${bookTitle}</td></tr>
          <tr><td style="padding: 8px;"><strong>Delivered To:</strong></td><td style="padding: 8px;">${address}, ${pincode}</td></tr>
          <tr><td style="padding: 8px;"><strong>Delivery Date:</strong></td><td style="padding: 8px;">${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td></tr>
          <tr><td style="padding: 8px;"><strong>Transaction ID:</strong></td><td style="padding: 8px;">${_id}</td></tr>
        </table>
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
    to: email,
    subject: `📦 Book Delivered - ${bookTitle} | Sachin Bansal's Book Store`,
    html: deliveryEmailContent,
  });
}

// Run the test
testCronJob();
