const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { JWT_SECRET } = require('../utils/helpers');

// POST /api/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) return res.status(400).json({ error: 'Usuario o contraseña incorrectos' });

  const validPassword = bcrypt.compareSync(password, user.password);
  if (!validPassword) return res.status(400).json({ error: 'Usuario o contraseña incorrectos' });

  const token = jwt.sign(
    { id: user.id, name: user.name, role: user.role, campaign: user.campaign, team: user.team },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.json({
    token,
    user: { id: user.id, name: user.name, role: user.role, campaign: user.campaign, team: user.team }
  });
});

module.exports = router;