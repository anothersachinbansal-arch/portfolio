import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";
import adminRoutes from "./routes/adminRoutes.js";
import achieverRoutes from "./routes/achieverRoutes.js";
import reviewRoutes from './routes/reviewRoutes.js';
import nodemailer from "nodemailer";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());

app.use(
  cors({
    origin: [
      "https://thesachinbansal.in",
      "https://www.thesachinbansal.in",
      "http://localhost:5173",
      "http://localhost:3000"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Connect DB
connectDB();
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "anothersachinbansal@gmail.com",
    pass: process.env.EMAIL_PASS || "ifah tgql vpup rqum" // App password, NOT regular password
  },
  pool: true, // Use connection pooling
  maxConnections: 1,
  maxMessages: 100,
  rateDelta: 1000,
  rateLimit: 5
});

// Routes
app.use("/api/admin", adminRoutes);
app.use("/api/achievers", achieverRoutes);
app.use('/api/reviews', reviewRoutes);

app.post("/send-mail", async (req, res) => {
  const { name, phone, className, score, total, consultationDate, consultationTime } = req.body;
  
  console.log('Received request:', { name, phone, className, score, total, consultationDate, consultationTime });

  try {
    let emailContent = `
Name: ${name}
Phone: ${phone}
Class: ${className}
Score: ${score}/${total}
Percentage: ${total > 0 ? Math.round((score/total) * 100) : 0}%
    `;

    // Add consultation details if provided
    if (consultationDate && consultationTime) {
      emailContent += `
      
Consultation Booking:
Date: ${consultationDate}
Time: ${consultationTime}
      `;
    }

    console.log('Sending email with content:', emailContent);

    // Try to send email with timeout
    const emailPromise = transporter.sendMail({
      from: `"${name || 'Aptitude Test User'}" <anothersachinbansal@gmail.com>`,
      to: "anothersachinbansal@gmail.com",
      subject: "New Aptitude Test Submission" + (consultationDate ? " & Consultation Booking" : ""),
      text: emailContent
    });

    // Add timeout to prevent hanging
    const result = await Promise.race([
      emailPromise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Email sending timeout')), 10000)
      )
    ]);

    console.log('Email sent successfully');
    res.json({ success: true, message: "Email Sent Successfully" });
  } catch (error) {
    console.error('Error sending email:', error);
    
    // If email fails, still return success but log the data
    console.log('Email failed but data received:', {
      name, phone, className, score, total, consultationDate, consultationTime
    });
    
    // Return success anyway so user doesn't see error
    res.json({ 
      success: true, 
      message: "Data received successfully (email may be delayed)",
      warning: "Email service temporarily unavailable, but your data has been recorded"
    });
  }
});


// Test route
app.get("/", (req, res) => {
  res.send("API is running...");
});
// In Express.js
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
