// Admin Authentication Middleware
const adminAuth = (req, res, next) => {
  // Check if admin is authenticated (you can implement your own logic)
  // For now, we'll use a simple admin key or session-based auth
  
  const adminKey = req.headers['admin-key'];
  const validAdminKey = process.env.ADMIN_KEY || 'admin123'; // Change this to a secure key
  
  // Check for admin key in headers
  if (adminKey && adminKey === validAdminKey) {
    return next();
  }
  
  // Check for admin session (if you implement session-based auth)
  if (req.session && req.session.isAdmin) {
    return next();
  }
  
  // Check for admin token in Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    if (token === validAdminKey) {
      return next();
    }
  }
  
  // If none of the above, deny access
  return res.status(401).json({
    success: false,
    message: 'Unauthorized - Admin access required'
  });
};

export default adminAuth;
