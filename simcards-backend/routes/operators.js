const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/operators - Obtener operadores (filtrados por equipo si es TL)
router.get('/', (req, res) => {
  try {
    const role = req.user?.role;
    const userTeam = req.user?.team;

    let query = `
      SELECT 
        o.*,
        GROUP_CONCAT(d.model, ', ') AS assigned_devices
      FROM operators o
      LEFT JOIN devices d ON d.assigned_operator_id = o.id
    `;
    
    const params = [];

    // Si no es Admin, solo ve los operadores de su propio equipo
    if (role !== 'admin' && role !== 'Administrador') {
      query += ` WHERE o.team = ? `;
      params.push(userTeam || null);
    }

    query += ` GROUP BY o.id ORDER BY o.full_name ASC`;

    const rows = db.prepare(query).all(...params);
    res.json(rows);
  } catch (err) {
    console.error('Error al obtener operadores:', err);
    res.status(500).json({ error: 'Error al obtener operadores' });
  }
});

// POST /api/operators - Crear operador asignando el equipo correspondiente
router.post('/', (req, res) => {
  try {
    const { full_name, shift, campaign, team } = req.body;

    const isAdmin = req.user?.role === 'admin' || req.user?.role === 'Administrador';
    // Si es Admin toma el equipo enviado en req.body; si es TL, toma automáticamente su equipo
    const targetTeam = isAdmin
      ? (team || req.user?.team || null)
      : (req.user?.team || null);

    if (!full_name || !shift) {
      return res.status(400).json({ error: 'El nombre y el turno son obligatorios' });
    }

    const query = `
      INSERT INTO operators (full_name, shift, campaign, team, status)
      VALUES (?, ?, ?, ?, 'ACTIVO')
    `;

    const info = db.prepare(query).run(
      full_name,
      shift,
      campaign || '',
      targetTeam
    );

    res.status(201).json({ 
      id: info.lastInsertRowid, 
      full_name, 
      shift, 
      campaign: campaign || '', 
      team: targetTeam, 
      status: 'ACTIVO' 
    });
  } catch (err) {
    console.error('Error al crear operador:', err);
    res.status(500).json({ error: 'Error al crear operador' });
  }
});

// PUT /api/operators/:id - Editar operador (permite a Admins cambiar de equipo)
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, shift, campaign, status, team } = req.body;

    // Consulta el operador actual para preservar el equipo si quien edita es un TL
    const existingOp = db.prepare('SELECT team FROM operators WHERE id = ?').get(id);
    if (!existingOp) {
      return res.status(404).json({ error: 'Operador no encontrado' });
    }

    const isAdmin = req.user?.role === 'admin' || req.user?.role === 'Administrador';
    // Si es Admin, asigna el nuevo 'team' seleccionado; si es TL, conserva el equipo actual del operador
    const targetTeam = isAdmin ? (team ?? existingOp.team) : existingOp.team;

    const query = `
      UPDATE operators 
      SET full_name = ?, shift = ?, campaign = ?, status = ?, team = ?
      WHERE id = ?
    `;

    db.prepare(query).run(
      full_name || '',
      shift || '',
      campaign || '',
      status || 'ACTIVO',
      targetTeam || null,
      id
    );

    res.json({ message: 'Operador actualizado correctamente' });
  } catch (err) {
    console.error('Error al actualizar operador:', err);
    res.status(500).json({ error: 'Error al actualizar operador' });
  }
});

// DELETE /api/operators/:id - Eliminar operador
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;

    db.prepare(`UPDATE devices SET assigned_operator_id = NULL WHERE assigned_operator_id = ?`).run(id);
    db.prepare(`DELETE FROM operators WHERE id = ?`).run(id);

    res.json({ message: 'Operador eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar operador:', err);
    res.status(500).json({ error: 'Error al eliminar operador' });
  }
});

module.exports = router;