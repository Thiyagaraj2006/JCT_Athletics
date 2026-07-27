import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  // Allow public access to GET players, stats, and performance for public profiles
  const isPublicRead = req.method === 'GET' && (
    req.originalUrl.startsWith('/api/players') ||
    req.originalUrl.startsWith('/api/stats') ||
    req.originalUrl.startsWith('/api/performance') ||
    req.originalUrl.startsWith('/api/competitions')
  );

  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    if (isPublicRead) {
      return next(); // Allow anonymous public read
    }
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_key_123');
    req.user = decoded; // Attach user info (id, role, name) to request
    next();
  } catch (error) {
    if (isPublicRead) {
      return next(); // Token invalid, but route is public read, so allow
    }
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden. Insufficient permissions.' });
    }
    next();
  };
};
