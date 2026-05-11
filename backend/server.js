// ===============================
// Imports
// ===============================
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cron from "node-cron";
import connectDB from "./config/db.js";
import adminRoutes from "./routes/adminRoutes.js";
import achieverRoutes from "./routes/achieverRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import youtubeRoutes from "./routes/youtubeRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import { Resend } from "resend";
import Payment from "./models/Payment.js";

// Load env
dotenv.config();

// Initialize Resend
export const resend = new Resend(process.env.RESEND_API);

// Load Models
import "./models/Question.js";
import "./models/YouTubeVideo.js";
import "./models/Payment.js";
import "./models/Book.js";

console.log("🚀 Server starting with Book Management System v2.0");
const app = express();

// ===============================
// Middleware
// ===============================
app.use(express.json());

app.use(
  cors({
    origin: [
      "https://thesachinbansal.in",
      "https://www.thesachinbansal.in",
      "http://localhost:5173",
      "http://localhost:3000",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ===============================
// Connect DB
// ===============================
connectDB();

// ===============================
// Routes
// ===============================
app.use("/api/admin", adminRoutes);
app.use("/api/achievers", achieverRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/youtube-videos", youtubeRoutes);
app.use("/api", paymentRoutes);
app.use("/api/books", bookRoutes);

// ===============================
// Send Mail Route (Resend)
// ===============================
app.post("/send-mail", async (req, res) => {
  const {
    name,
    phone,
    className,
    score,
    total,
    consultationDate,
    consultationTime,
    results,
  } = req.body;

  try {
    const emailContent = `
      <h2>Aptitude Test Result </h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Class:</strong> ${className}</p>
      <p><strong>Score:</strong> ${score}/${total}</p>
      
      <h3>Detailed Results:</h3>
      <pre>${results}</pre>

      ${
        consultationDate && consultationTime
          ? `
        <h3>Consultation Booking Details</h3>
        <p><strong>Date:</strong> ${consultationDate}</p>
        <p><strong>Time:</strong> ${consultationTime}</p>
      `
          : ""
      }
    `;

    await resend.emails.send({
      from: "Aptitude Test <onboarding@resend.dev>",
      to: "anotherdimplekataria@gmail.com",
      subject:
        consultationDate && consultationTime
          ? "New Aptitude Test + Consultation Booking"
          : "New Aptitude Test Submission",
      html: emailContent,
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Email Error:", error);
    res.status(500).json({ success: false, error });
  }
});
app.post("/send-mail-result", async (req, res) => {
  const { name, phone, className, score, total, results } = req.body;

  try {
    // Email HTML content
    const emailContent = `
      <h2>Aptitude Test Result</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Class:</strong> ${className}</p>
      <p><strong>Score:</strong> ${score}/${total}</p>
      
      <h3>Detailed Results:</h3>
      <pre>${results}</pre>
    `;

    // Send email using Resend
    await resend.emails.send({
      from: "Aptitude Test <onboarding@resend.dev>",
      to: "anotherdimplekataria@gmail.com", // Change to recipient
      subject: "New Aptitude Test Submission",
      html: emailContent,
    });

    res.json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.error("Email Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});



// Add this route before the error handling middleware
app.post("/send-mail-careertest", async (req, res) => {
  const {
    name,
    phone,
    className,
    date,
    time,
    results,
    testType
  } = req.body;

  try {
    const emailContent = `
      <h2>${testType || 'Career Aptitude Test Results'}</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Class:</strong> ${className}</p>
      
      <h3>Test Results:</h3>
      <pre>${results}</pre>

      ${date && time ? `
        <h3>Consultation Details:</h3>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time}</p>
      ` : ''}
    `;

    await resend.emails.send({
      from: "Career Aptitude Test <onboarding@resend.dev>",
      to: "anotherdimplekataria@gmail.com",
      subject: date && time 
        ? "Career Test + Consultation Booking" 
        : "Career Test Results",
      html: emailContent
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Email Error:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to send email" 
    });
  }
});




// ===============================
// Health Check
// ===============================
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// Root route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// ===============================
// Email Cron Job - Runs Every Minute
// ===============================
cron.schedule('* * * * *', async () => {
  try {
    console.log('🔄 Running email cron job...');
    
    // Check for orders that need confirmation email (status: success, orderedEmail: false)
    const pendingOrderEmails = await Payment.find({
      status: 'success',
      orderedEmail: false
    });
    
    for (const payment of pendingOrderEmails) {
      try {
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
    
    for (const payment of pendingDeliveryEmails) {
      try {
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
    
  } catch (error) {
    console.error('❌ Cron job error:', error);
  }
});

// ===============================
// Email Helper Functions
// ===============================
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
    to: email,
    subject: `📦 Book Delivered - ${bookTitle} | Sachin Bansal's Book Store`,
    html: deliveryEmailContent,
  });
}

// ===============================
// Start Server
// ===============================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`⏰ Email cron job started - runs every minute`);
});
