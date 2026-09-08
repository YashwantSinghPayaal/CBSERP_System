const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'cbserp_super_secret_jwt_key_2026';

const protect = (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.userType === 'admin') {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Access denied: Admin authority required' });
  }
};

const studentOnly = (req, res, next) => {
  if (req.user && req.user.userType === 'student') {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Access denied: Student access only' });
  }
};

module.exports = { protect, adminOnly, studentOnly, JWT_SECRET };
