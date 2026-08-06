const jwt = require('jsonwebtoken');

const JWT_SECRET = 'secreto_simcards_key_2026';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Acceso denegado, token no proporcionado' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido o expirado' });
    req.user = user;
    next();
  });
};

const cleanDigits = (num) => num ? num.toString().replace(/\D/g, '') : '';
const normalizePhone = (phone) => phone ? phone.toString().replace(/\D/g, '').slice(-10) : '';

module.exports = {
  JWT_SECRET,
  authenticateToken,
  cleanDigits,
  normalizePhone
};