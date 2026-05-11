import express from "express";
import jwt from "jsonwebtoken";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

// Admin Login - Generate JWT Token
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Simple admin credentials (in production, use database)
    const ADMIN_EMAIL = "admin@sachinbansal.com";
    const ADMIN_PASSWORD = "admin123";
    
    // Validate credentials
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      {
        id: "admin_001",
        email: ADMIN_EMAIL,
        role: "admin"
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "24h"
      }
    );
    
    res.json({
      success: true,
      message: "Login successful",
      token: token,
      admin: {
        id: "admin_001",
        email: ADMIN_EMAIL,
        role: "admin"
      },
      expiresIn: process.env.JWT_EXPIRES_IN || "24h"
    });
    
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// Verify Token (for testing)
router.get("/verify", adminAuth, (req, res) => {
  res.json({
    success: true,
    message: "Token is valid",
    admin: req.admin
  });
});

export default router;
