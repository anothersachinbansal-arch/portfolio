import jwt from 'jsonwebtoken';

// Admin Authentication Middleware using JWT
const adminAuth = (req, res, next) => {
  try {
    // Check for JWT token in Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - No token provided'
      });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if token is for admin
    if (decoded.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - Admin access required'
      });
    }
    
    // Attach admin info to request
    req.admin = {
      id: decoded.id,
      role: decoded.role,
      email: decoded.email
    };
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - Token expired'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export default adminAuth;
