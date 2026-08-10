const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { JWT_SECRET } = require('../utils/helpers');

// Middleware para verificar el Token JWT y obtener los datos en tiempo real de la BD
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Acceso no autorizado (Token faltante)' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido o expirado' });
    }

    try {
      // Consulta en tiempo real a la BD para obtener el rol/equipo actualizados del usuario
      const freshUser = db.prepare('SELECT id, name, email, role, campaign, team FROM users WHERE id = ?').get(decoded.id);

      if (!freshUser) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      req.user = freshUser;
      next();
    } catch (dbErr) {
      console.error('Error al verificar usuario en middleware:', dbErr);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
};

// GET /api/auth/me - Permite al Frontend solicitar los datos actualizados del usuario en cualquier momento
router.get('/me', authenticateToken, (req, res) => {
  res.json(req.user);
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) return res.status(400).json({ error: 'Usuario o contraseña incorrectos' });

  const validPassword = bcrypt.compareSync(password, user.password);
  if (!validPassword) return res.status(400).json({ error: 'Usuario o contraseña incorrectos' });

  const payload = {
    id: user.id,
    name: user.name,
    role: user.role,
    campaign: user.campaign,
    team: user.team
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

  res.json({ token, user: payload });
});

module.exports = { router, authenticateToken };