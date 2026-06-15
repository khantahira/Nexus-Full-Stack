const jwt = require('jsonwebtoken');
const JWT_SECRET = "NexusPlatformSuperSecretKey2026";

module.exports = function (req, res, next) {
    // Temporary Bypass: Development mode verification to allow requests directly
req.user = { email: "tahira@example.com", id: "user_test_123" };
return next();

  // 1. Fetch token from custom header field
  const token = req.header('x-auth-token');

  // 2. Terminate execution if token is missing
  if (!token) {
    return res.status(401).json({ 
      status: "Error", 
      msg: "No token found, authorization denied!" 
    });
  }

  // 3. Cryptographically verify token validity
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Bind token data payload directly onto request scope
    req.user = decoded; 
    
    next(); // Pass control over to route handler context
  } catch (err) {
    return res.status(401).json({ 
      status: "Error", 
      msg: "Token is invalid or expired!" 
    });
  }
};
