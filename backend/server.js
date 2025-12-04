// ===============================
// Imports
// ===============================
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import adminRoutes from "./routes/adminRoutes.js";
import achieverRoutes from "./routes/achieverRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import { Resend } from "resend";

// Load env
dotenv.config();

// Initialize Resend
const resend = new Resend(process.env.RESEND_API);

// Load Models
import "./models/Question.js";

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
  } = req.body;

  try {
    const emailContent = `
      <h2>New Aptitude Test Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Class:</strong> ${className}</p>
      <p><strong>Score:</strong> ${score}/${total}</p>

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
      to: "kishan817835@gmail.com",
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
// Start Server
// ===============================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  (`🚀 Server running on port ${PORT}`);
});
