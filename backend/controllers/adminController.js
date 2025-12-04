import Admin from "../models/Admin.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  // Input validation
  if (!email || !password) {
    return res.status(400).json({ 
      success: false, 
      message: "Email and password are required" 
    });
  }

  try {
    ("Attempting to find admin with email:", email);
    const admin = await Admin.findOne({ email }).select("+password name email role");
    
    if (!admin) {
      ("No admin found with email:", email);
      return res.status(401).json({ 
        success: false, 
        message: "Invalid email or password" 
      });
    }

    ("Admin found, comparing password...");
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      ("Password does not match for admin:", email);
      return res.status(401).json({ 
        success: false, 
        message: "Invalid email or password" 
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not set in environment variables");
      return res.status(500).json({ 
        success: false, 
        message: "Server configuration error" 
      });
    }

    ("Generating JWT token...");
    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    ("Login successful for admin:", email);
    res.json({ 
      success: true,
      token, 
      email: admin.email, 
      name: admin.name, 
      role: admin.role 
    });
  } catch (err) {
    console.error("Error in loginAdmin:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error during login",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

