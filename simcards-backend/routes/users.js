const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db');
const { authenticateToken } = require('./auth');

// GET /api/teams - Listar todos los equipos / ciudades
router.get('/teams', authenticateToken, (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT DISTINCT name FROM (
        SELECT name FROM teams WHERE name IS NOT NULL AND TRIM(name) != ''
        UNION
        SELECT team AS name FROM users WHERE team IS NOT NULL AND TRIM(team) != ''
        UNION
        SELECT team AS name FROM devices WHERE team IS NOT NULL AND TRIM(team) != ''
      ) ORDER BY name ASC
    `).all();

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/teams - Crear nuevo equipo / ciudad (Solo Admin)
router.post('/teams', authenticateToken, (req, res) => {
  const currentUser = db.prepare('SELECT role FROM users WHERE id = ?').get(req.user.id);
  const userRole = currentUser?.role || req.user.role;

  if (userRole?.toLowerCase() !== 'admin' && userRole !== 'Administrador') {
    return res.status(403).json({ error: 'Acceso denegado' });
  }

  const { name } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'El nombre del equipo es obligatorio.' });
  }

  try {
    const cleanName = name.trim();
    const result = db.prepare('INSERT INTO teams (name) VALUES (?)').run(cleanName);
    res.json({ id: result.lastInsertRowid, name: cleanName, message: 'Equipo creado con éxito' });
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'El equipo o ciudad ya existe.' });
    }
    res.status(500).json({ error: 'Error al registrar el equipo en la base de datos.' });
  }
});

// PUT /api/teams/rename - Renombrar equipo y actualizar referencias en cascada (Solo Admin)
router.put('/teams/rename', authenticateToken, (req, res) => {
  const currentUser = db.prepare('SELECT role FROM users WHERE id = ?').get(req.user.id);
  const userRole = currentUser?.role || req.user.role;

  if (userRole?.toLowerCase() !== 'admin' && userRole !== 'Administrador') {
    return res.status(403).json({ error: 'Acceso denegado' });
  }

  const { oldName, newName } = req.body;

  if (!oldName || !newName || !newName.trim()) {
    return res.status(400).json({ error: 'El nombre actual y el nuevo nombre son obligatorios.' });
  }

  const oldClean = oldName.trim();
  const newClean = newName.trim();

  if (oldClean === newClean) {
    return res.json({ message: 'El nombre no ha cambiado.' });
  }

  // Transacción segura: Si falla alguna tabla, no se aplica ningún cambio
  const renameTransaction = db.transaction((fromName, toName) => {
    db.prepare('UPDATE teams SET name = ? WHERE name = ?').run(toName, fromName);
    db.prepare('UPDATE users SET team = ? WHERE team = ?').run(toName, fromName);
    db.prepare('UPDATE simcards SET team = ? WHERE team = ?').run(toName, fromName);
    db.prepare('UPDATE devices SET team = ? WHERE team = ?').run(toName, fromName);
    db.prepare('UPDATE operators SET team = ? WHERE team = ?').run(toName, fromName);
  });

  try {
    renameTransaction(oldClean, newClean);
    res.json({ message: `Equipo '${oldClean}' renombrado a '${newClean}' correctamente.` });
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Ya existe un equipo registrado con ese nombre.' });
    }
    res.status(500).json({ error: 'Error al renombrar el equipo: ' + err.message });
  }
});

// DELETE /api/teams/:id - Eliminar equipo (Solo Admin)
router.delete('/teams/:id', authenticateToken, (req, res) => {
  const currentUser = db.prepare('SELECT role FROM users WHERE id = ?').get(req.user.id);
  const userRole = currentUser?.role || req.user.role;

  if (userRole?.toLowerCase() !== 'admin' && userRole !== 'Administrador') {
    return res.status(403).json({ error: 'Acceso denegado' });
  }

  const { id } = req.params;

  try {
    const result = db.prepare('DELETE FROM teams WHERE id = ? OR name = ?').run(id, id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Equipo no encontrado.' });
    }
    res.json({ message: 'Equipo eliminado con éxito' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/users - Listar usuarios (Solo Admin)
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

// POST /api/users - Crear usuario (Solo Admin)
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

// PUT /api/users/:id - Actualizar usuario (Solo Admin)
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

// DELETE /api/users/:id - Eliminar usuario (Solo Admin)
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