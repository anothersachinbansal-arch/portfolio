import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";
import adminRoutes from "./routes/adminRoutes.js";
import achieverRoutes from "./routes/achieverRoutes.js";
import reviewRoutes from './routes/reviewRoutes.js';
import questionRoutes from './routes/questionRoutes.js';
import nodemailer from "nodemailer";

// Import models
import './models/Question.js';

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
    user: "anothersachinbansal@gmail.com",
    pass: "ifah tgql vpup rqum" // NOT Gmail password
  }
});

// Routes
app.use("/api/admin", adminRoutes);
app.use("/api/achievers", achieverRoutes);
app.use('/api/reviews', reviewRoutes);
app.use("/api/questions", questionRoutes);

app.post("/send-mail", async (req, res) => {
  const { name, phone, className, score, total, consultationDate, consultationTime } = req.body;

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

    await transporter.sendMail({
      from: "anothersachinbansal@gmail.com",
      to: "anothersachinbansal@gmail.com", // jisme mail chahiye
      subject: "New Aptitude Test Submission" + (consultationDate ? " & Consultation Booking Date & Time" : ""),
      text: emailContent
    });

    res.json({ success: true, message: "Email Sent Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error sending email" });
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
