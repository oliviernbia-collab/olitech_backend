const { verifyToken } = require('../utils/jwt');

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ success: false, message: 'Authentification requise.' });
  }

  try {
    req.admin = verifyToken(token);
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Session invalide ou expiree.' });
  }
}

module.exports = requireAuth;
