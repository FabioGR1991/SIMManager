const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../utils/helpers');

// GET /api/simcards
router.get('/', authenticateToken, (req, res) => {
  try {
    const currentUser = db.prepare('SELECT role, team FROM users WHERE id = ?').get(req.user.id);
    const userRole = currentUser?.role || req.user.role;
    const userTeam = currentUser?.team || req.user.team;
    const isAdmin = userRole?.toLowerCase() === 'admin' || userRole === 'Administrador';

    let sims;
    if (isAdmin) {
      sims = db.prepare(`
        SELECT 
          simcards.*, 
          COALESCE(simcards.team, users.team, 'Sin Equipo') as team,
          users.name as user_name,
          devices.model as device_model,
          devices.id as device_id
        FROM simcards 
        LEFT JOIN users ON simcards.user_id = users.id
        LEFT JOIN devices ON (simcards.phone_number = devices.sim1_phone OR simcards.phone_number = devices.sim2_phone)
        ORDER BY simcards.id DESC
      `).all();
    } else {
      sims = db.prepare(`
        SELECT 
          simcards.*,
          COALESCE(simcards.team, users.team) as team,
          users.name as user_name,
          devices.model as device_model,
          devices.id as device_id
        FROM simcards 
        LEFT JOIN users ON simcards.user_id = users.id
        LEFT JOIN devices ON (simcards.phone_number = devices.sim1_phone OR simcards.phone_number = devices.sim2_phone)
        WHERE COALESCE(simcards.team, users.team) = ? 
        ORDER BY simcards.id DESC
      `).all(userTeam);
    }
    res.json(sims);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/simcards
router.post('/', authenticateToken, (req, res) => {
  const { phone_number, status, campaign, assigned_user_id, team, wa_type, wa_link } = req.body;
  
  const currentUser = db.prepare('SELECT campaign, team FROM users WHERE id = ?').get(req.user.id);
  const userId = assigned_user_id || req.user.id; 
  const simCampaign = campaign || currentUser?.campaign || req.user.campaign || 'General';
  const simTeam = team || currentUser?.team || req.user.team;

  try {
    const result = db.prepare(`
      INSERT INTO simcards (phone_number, status, user_id, campaign, team, wa_type, wa_link)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      phone_number, 
      status || 'En stock/Sin uso', 
      userId, 
      simCampaign, 
      simTeam, 
      wa_type || null, 
      wa_link || null
    );

    res.json({ id: result.lastInsertRowid, message: 'SIMCard registrada con éxito' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/simcards/edit/:id
router.put('/edit/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { phone_number, campaign, team, wa_type, wa_link } = req.body;

  try {
    if (team) {
      db.prepare(`
        UPDATE simcards 
        SET phone_number = ?, campaign = ?, team = ?, wa_type = ?, wa_link = ? 
        WHERE id = ?
      `).run(phone_number, campaign, team, wa_type || null, wa_link || null, id);
    } else {
      db.prepare(`
        UPDATE simcards 
        SET phone_number = ?, campaign = ?, wa_type = ?, wa_link = ? 
        WHERE id = ?
      `).run(phone_number, campaign, wa_type || null, wa_link || null, id);
    }

    res.json({ message: 'Línea actualizada con éxito' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/simcards/:id (Cambio de estado y trazabilidad)
router.put('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { new_status, observation } = req.body;

  try {
    const currentSim = db.prepare('SELECT * FROM simcards WHERE id = ?').get(id);
    if (!currentSim) return res.status(404).json({ error: 'SIMCard no encontrada' });

    const currentUser = db.prepare('SELECT role FROM users WHERE id = ?').get(req.user.id);
    const userRole = currentUser?.role || req.user.role;

    if (currentSim.status === 'Repuesto' && userRole?.toLowerCase() !== 'admin' && userRole !== 'Administrador') {
      return res.status(403).json({ 
        error: 'Esta línea fue marcada como Repuesto por un Administrador y no puede ser modificada.' 
      });
    }

    db.prepare(`
      INSERT INTO sim_logs (simcard_id, user_id, previous_status, new_status, observation)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, req.user.id, currentSim.status, new_status, observation || '');

    db.prepare('UPDATE simcards SET status = ? WHERE id = ?').run(new_status, id);

    res.json({ message: 'Estado actualizado y trazabilidad registrada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/simcards/:id/logs
router.get('/:id/logs', authenticateToken, (req, res) => {
  const { id } = req.params;
  try {
    const logs = db.prepare(`
      SELECT sim_logs.*, users.name as user_name 
      FROM sim_logs 
      LEFT JOIN users ON sim_logs.user_id = users.id 
      WHERE simcard_id = ? 
      ORDER BY created_at DESC
    `).all(id);

    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/simcards/:id
router.delete('/:id', authenticateToken, (req, res) => {
  const currentUser = db.prepare('SELECT role FROM users WHERE id = ?').get(req.user.id);
  const userRole = currentUser?.role || req.user.role;

  if (userRole?.toLowerCase() !== 'admin' && userRole !== 'Administrador') {
    return res.status(403).json({ error: 'No tienes permisos de administrador' });
  }

  const { id } = req.params;

  try {
    db.prepare('DELETE FROM sim_logs WHERE simcard_id = ?').run(id);
    const result = db.prepare('DELETE FROM simcards WHERE id = ?').run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'SIMCard no encontrada' });
    }

    res.json({ message: 'Línea y su historial eliminados correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;