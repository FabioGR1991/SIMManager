const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, cleanDigits } = require('../utils/helpers');

// GET /api/devices
router.get('/', authenticateToken, (req, res) => {
  try {
    const currentUser = db.prepare('SELECT role, team FROM users WHERE id = ?').get(req.user.id);
    const userRole = currentUser?.role || req.user.role;
    const userTeam = currentUser?.team || req.user.team;
    const isAdmin = userRole?.toLowerCase() === 'admin' || userRole === 'Administrador';

    let devices;
    if (isAdmin) {
      devices = db.prepare(`
        SELECT devices.*, users.name as user_name 
        FROM devices 
        LEFT JOIN users ON devices.user_id = users.id 
        ORDER BY devices.id DESC
      `).all();
    } else {
      devices = db.prepare(`
        SELECT devices.*, users.name as user_name 
        FROM devices 
        LEFT JOIN users ON devices.user_id = users.id 
        WHERE devices.team = ? 
        ORDER BY devices.id DESC
      `).all(userTeam);
    }

    res.json(devices);
  } catch (err) {
    console.error('Error al obtener dispositivos:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/devices
router.post('/', authenticateToken, (req, res) => {
  const { model, sim1_phone, sim2_phone, status } = req.body;

  try {
    const currentUser = db.prepare('SELECT role, team FROM users WHERE id = ?').get(req.user.id);
    const userRole = currentUser?.role || req.user.role;
    const userTeam = currentUser?.team || req.user.team;
    const isAdmin = userRole?.toLowerCase() === 'admin' || userRole === 'Administrador';

    const simcards = db.prepare(`
      SELECT simcards.*, users.team as user_team 
      FROM simcards 
      LEFT JOIN users ON simcards.user_id = users.id
    `).all();

    const allDevices = db.prepare('SELECT * FROM devices').all();

    const phonesToCheck = [
      { phone: sim1_phone, slot: 'SIM 1' },
      { phone: sim2_phone, slot: 'SIM 2' }
    ].filter(item => item.phone && item.phone !== 'N/A' && item.phone !== 'NO_TIENE');

    for (const item of phonesToCheck) {
      const cleanInput = cleanDigits(item.phone);

      const existingDevice = allDevices.find(dev => 
        cleanDigits(dev.sim1_phone) === cleanInput || cleanDigits(dev.sim2_phone) === cleanInput
      );

      if (existingDevice) {
        return res.status(400).json({ 
          error: `El número ${item.phone} (${item.slot}) ya está en uso por el dispositivo "${existingDevice.model}". Para asignarlo aquí, debes liberarlo de ese equipo primero.` 
        });
      }

      const sim = simcards.find(s => cleanDigits(s.phone_number) === cleanInput);
      if (!sim) {
        return res.status(400).json({ error: `La línea ${item.phone} (${item.slot}) no existe en el sistema.` });
      }

      if (!isAdmin && sim.user_team !== userTeam) {
        return res.status(403).json({ error: `La línea ${item.phone} (${item.slot}) no pertenece a ningún usuario de tu equipo (${userTeam}).` });
      }
    }

    const result = db.prepare(`
      INSERT INTO devices (model, sim1_phone, sim2_phone, status, user_id, team) 
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(model, sim1_phone || null, sim2_phone || 'NO_TIENE', status || 'ACTIVO', req.user.id, userTeam);

    res.json({ id: result.lastInsertRowid, message: 'Dispositivo guardado correctamente' });

  } catch (err) {
    console.error('Error al guardar dispositivo:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/devices/:id
router.put('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { model, sim1_phone, sim2_phone, status } = req.body;

  try {
    const device = db.prepare('SELECT * FROM devices WHERE id = ?').get(id);
    if (!device) return res.status(404).json({ error: 'Dispositivo no encontrado.' });

    const currentUser = db.prepare('SELECT role, team FROM users WHERE id = ?').get(req.user.id);
    const userRole = currentUser?.role || req.user.role;
    const userTeam = currentUser?.team || req.user.team;
    const isAdmin = userRole?.toLowerCase() === 'admin' || userRole === 'Administrador';

    if (!isAdmin && device.team && device.team !== userTeam) {
      return res.status(403).json({ error: 'No tienes permiso para editar este dispositivo ya que pertenece a otro equipo.' });
    }

    const simcards = db.prepare(`
      SELECT simcards.*, users.team as user_team 
      FROM simcards 
      LEFT JOIN users ON simcards.user_id = users.id
    `).all();

    const otherDevices = db.prepare('SELECT * FROM devices WHERE id != ?').all(id);

    const phonesToCheck = [
      { phone: sim1_phone, slot: 'SIM 1' },
      { phone: sim2_phone, slot: 'SIM 2' }
    ].filter(item => item.phone && item.phone !== 'N/A' && item.phone !== 'NO_TIENE');

    for (const item of phonesToCheck) {
      const cleanInput = cleanDigits(item.phone);

      const existingDevice = otherDevices.find(dev => 
        cleanDigits(dev.sim1_phone) === cleanInput || cleanDigits(dev.sim2_phone) === cleanInput
      );

      if (existingDevice) {
        return res.status(400).json({ 
          error: `El número ${item.phone} (${item.slot}) ya está en uso por el dispositivo "${existingDevice.model}". Deberás removerlo de ese dispositivo para poder asignarlo aquí.` 
        });
      }

      const sim = simcards.find(s => cleanDigits(s.phone_number) === cleanInput);
      if (!sim) {
        return res.status(400).json({ error: `La línea ${item.phone} (${item.slot}) no existe en el sistema.` });
      }

      if (!isAdmin && sim.user_team !== userTeam) {
        return res.status(403).json({ error: `La línea ${item.phone} (${item.slot}) no pertenece a tu equipo.` });
      }
    }

    db.prepare(`
      UPDATE devices 
      SET model = ?, sim1_phone = ?, sim2_phone = ?, status = ? 
      WHERE id = ?
    `).run(model, sim1_phone || null, sim2_phone || 'NO_TIENE', status || 'ACTIVO', id);

    res.json({ message: 'Dispositivo actualizado correctamente' });

  } catch (err) {
    console.error('Error al actualizar dispositivo:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/devices/:id
router.delete('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  try {
    const device = db.prepare('SELECT * FROM devices WHERE id = ?').get(id);
    if (!device) return res.status(404).json({ error: 'Dispositivo no encontrado.' });

    const currentUser = db.prepare('SELECT role, team FROM users WHERE id = ?').get(req.user.id);
    const userRole = currentUser?.role || req.user.role;
    const userTeam = currentUser?.team || req.user.team;
    const isAdmin = userRole?.toLowerCase() === 'admin' || userRole === 'Administrador';

    if (!isAdmin && device.team && device.team !== userTeam) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar este dispositivo.' });
    }

    db.prepare('DELETE FROM devices WHERE id = ?').run(id);
    res.json({ message: 'Dispositivo eliminado correctamente' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;