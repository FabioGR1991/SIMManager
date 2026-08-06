const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db');
const { authenticateToken } = require('../utils/helpers');

// GET /api/teams
router.get('/teams', authenticateToken, (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT DISTINCT team FROM (
        SELECT team FROM users WHERE team IS NOT NULL AND TRIM(team) != ''
        UNION
        SELECT team FROM devices WHERE team IS NOT NULL AND TRIM(team) != ''
      ) ORDER BY team ASC
    `).all();

    const teams = rows.map(r => r.team);
    res.json(teams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/users
router.get('/users', authenticateToken, (req, res) => {
  const currentUser = db.prepare('SELECT role FROM users WHERE id = ?').get(req.user.id);
  const userRole = currentUser?.role || req.user.role;

  if (userRole?.toLowerCase() !== 'admin' && userRole !== 'Administrador') {
    return res.status(403).json({ error: 'Acceso denegado' });
  }
  try {
    const users = db.prepare('SELECT id, name, email, role, campaign, team FROM users ORDER BY id DESC').all();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/users
router.post('/users', authenticateToken, (req, res) => {
  const currentUser = db.prepare('SELECT role FROM users WHERE id = ?').get(req.user.id);
  const userRole = currentUser?.role || req.user.role;

  if (userRole?.toLowerCase() !== 'admin' && userRole !== 'Administrador') {
    return res.status(403).json({ error: 'Acceso denegado' });
  }

  const { name, email, password, role, campaign, team } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Nombre, email y contraseña son obligatorios' });
  }

  try {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const result = db.prepare(`
      INSERT INTO users (name, email, password, role, campaign, team)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(name, email, hashedPassword, role || 'tl', campaign || 'General', team || '');

    res.json({ id: result.lastInsertRowid, message: 'Usuario creado con éxito' });
  } catch (err) {
    res.status(500).json({ error: 'El correo electrónico ya se encuentra registrado o hubo un error.' });
  }
});

// PUT /api/users/:id
router.put('/users/:id', authenticateToken, (req, res) => {
  const dbUser = db.prepare('SELECT role FROM users WHERE id = ?').get(req.user.id);
  const userRole = dbUser?.role || req.user.role;

  if (userRole?.toLowerCase() !== 'admin' && userRole !== 'Administrador') {
    return res.status(403).json({ error: 'Acceso denegado' });
  }

  const { id } = req.params;
  const { name, email, role, campaign, team, password } = req.body;

  try {
    const currentUser = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!currentUser) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const updatedName = name !== undefined ? name : currentUser.name;
    const updatedEmail = email !== undefined ? email : currentUser.email;
    const updatedRole = role !== undefined ? role : currentUser.role;
    const updatedCampaign = campaign !== undefined ? campaign : currentUser.campaign;
    const updatedTeam = team !== undefined ? team : currentUser.team;

    // Actualización de usuario aislada (sin alterar SIMs ni Dispositivos)
    if (password && password.trim() !== '') {
      const hashedPassword = bcrypt.hashSync(password, 10);
      db.prepare(`
        UPDATE users 
        SET name = ?, email = ?, role = ?, campaign = ?, team = ?, password = ? 
        WHERE id = ?
      `).run(updatedName, updatedEmail, updatedRole, updatedCampaign, updatedTeam, hashedPassword, id);
    } else {
      db.prepare(`
        UPDATE users 
        SET name = ?, email = ?, role = ?, campaign = ?, team = ? 
        WHERE id = ?
      `).run(updatedName, updatedEmail, updatedRole, updatedCampaign, updatedTeam, id);
    }

    res.json({ 
      message: 'Usuario actualizado correctamente',
      user: { id: parseInt(id), name: updatedName, email: updatedEmail, role: updatedRole, campaign: updatedCampaign, team: updatedTeam }
    });
  } catch (err) {
    console.error('Error al actualizar usuario:', err);
    res.status(500).json({ error: 'Error al actualizar usuario en la base de datos.' });
  }
});

// DELETE /api/users/:id
router.delete('/users/:id', authenticateToken, (req, res) => {
  const currentUser = db.prepare('SELECT role FROM users WHERE id = ?').get(req.user.id);
  const userRole = currentUser?.role || req.user.role;

  if (userRole?.toLowerCase() !== 'admin' && userRole !== 'Administrador') {
    return res.status(403).json({ error: 'Acceso denegado' });
  }

  const { id } = req.params;

  if (parseInt(id) === req.user.id) {
    return res.status(400).json({ error: 'No podés eliminar tu propio usuario actual.' });
  }

  try {
    const result = db.prepare('DELETE FROM users WHERE id = ?').run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ message: 'Usuario eliminado con éxito' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;