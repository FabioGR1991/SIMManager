const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, cleanDigits } = require('../utils/helpers');

// GET /api/devices - Listar dispositivos con soporte para búsqueda (q) y filtros (status, entity)
router.get('/', authenticateToken, (req, res) => {
  try {
    const { q, status, entity } = req.query;

    const currentUser = db.prepare('SELECT role, team FROM users WHERE id = ?').get(req.user.id);
    const userRole = currentUser?.role || req.user.role;
    const userTeam = currentUser?.team || req.user.team;
    const isAdmin = userRole?.toLowerCase() === 'admin' || userRole === 'Administrador';

    let baseQuery = `
      SELECT 
        devices.*, 
        users.name as user_name,
        op1.full_name as operator_name,
        op1.full_name as operator1_name,
        op1.full_name as assigned_operator_name,
        op2.full_name as operator2_name,
        s1.phone_number as sim1_number,
        s1.wa_type as sim1_wa_type,
        s1.wa_link as sim1_wa_link,
        s2.phone_number as sim2_number,
        s2.wa_type as sim2_wa_type,
        s2.wa_link as sim2_wa_link
      FROM devices 
      LEFT JOIN users ON devices.user_id = users.id 
      LEFT JOIN operators op1 ON devices.assigned_operator_id = op1.id
      LEFT JOIN operators op2 ON devices.assigned_operator2_id = op2.id
      LEFT JOIN simcards s1 ON devices.sim1_id = s1.id
      LEFT JOIN simcards s2 ON devices.sim2_id = s2.id
    `;

    const conditions = [];
    const params = [];

    // Restricción de permisos por equipo si no es Admin
    if (!isAdmin) {
      conditions.push('devices.team = ?');
      params.push(userTeam);
    }

    // Filtro por Estado
    if (status && status !== 'TODOS') {
      conditions.push('devices.status = ?');
      params.push(status);
    }

    // Filtro por Entidad
    if (entity && entity !== 'TODAS') {
      conditions.push('devices.entity = ?');
      params.push(entity);
    }

    // Motor de Búsqueda rápida (q)
    if (q && q.trim() !== '') {
      const searchTerm = `%${q.trim()}%`;
      conditions.push(`(
        devices.model LIKE ? OR 
        devices.internal_name LIKE ? OR 
        devices.entity LIKE ? OR 
        s1.phone_number LIKE ? OR 
        s2.phone_number LIKE ? OR 
        devices.sim1_phone LIKE ? OR 
        devices.sim2_phone LIKE ? OR 
        op1.full_name LIKE ? OR 
        op2.full_name LIKE ?
      )`);
      params.push(
        searchTerm, searchTerm, searchTerm, 
        searchTerm, searchTerm, searchTerm, 
        searchTerm, searchTerm, searchTerm
      );
    }

    const whereClause = conditions.length > 0 ? ` WHERE ${conditions.join(' AND ')}` : '';
    const finalQuery = `${baseQuery}${whereClause} ORDER BY devices.id DESC`;

    const devices = db.prepare(finalQuery).all(...params);

    res.json(devices);
  } catch (err) {
    console.error('Error al obtener dispositivos:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/devices - Crear un nuevo dispositivo
router.post('/', authenticateToken, (req, res) => {
  const {
    model,
    internal_name,
    entity,
    assigned_operator_id,
    assigned_operator2_id,
    sim1_phone,
    sim2_phone,
    sim1_id,
    sim2_id,
    sim1_is_official,
    sim2_is_official,
    status,
    team
  } = req.body;

  try {
    const currentUser = db.prepare('SELECT role, team FROM users WHERE id = ?').get(req.user.id);
    const userRole = currentUser?.role || req.user.role;
    const userTeam = currentUser?.team || req.user.team;
    const isAdmin = userRole?.toLowerCase() === 'admin' || userRole === 'Administrador';

    const deviceTeam = isAdmin ? (team || userTeam) : userTeam;

    // Obtener SIMCards para validaciones
    const simcards = db.prepare(`
      SELECT simcards.*, users.team as user_team 
      FROM simcards 
      LEFT JOIN users ON simcards.user_id = users.id
    `).all();

    const allDevices = db.prepare('SELECT * FROM devices').all();

    // Determinar teléfonos efectivos a validar
    let effectiveSim1Phone = sim1_phone;
    let effectiveSim2Phone = sim2_phone;

    if (sim1_id) {
      const sim1 = simcards.find(s => s.id === Number(sim1_id));
      if (sim1) effectiveSim1Phone = sim1.phone_number;
    }

    if (sim2_id) {
      const sim2 = simcards.find(s => s.id === Number(sim2_id));
      if (sim2) effectiveSim2Phone = sim2.phone_number;
    }

    const phonesToCheck = [
      { phone: effectiveSim1Phone, slot: 'SIM 1' },
      { phone: effectiveSim2Phone, slot: 'SIM 2' }
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
      INSERT INTO devices (
        model, internal_name, entity, assigned_operator_id, assigned_operator2_id,
        sim1_phone, sim2_phone, sim1_id, sim2_id, 
        sim1_is_official, sim2_is_official, status, user_id, team
      ) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      model,
      internal_name || null,
      entity || null,
      assigned_operator_id ? Number(assigned_operator_id) : null,
      assigned_operator2_id ? Number(assigned_operator2_id) : null,
      effectiveSim1Phone || null,
      effectiveSim2Phone || 'NO_TIENE',
      sim1_id ? Number(sim1_id) : null,
      sim2_id ? Number(sim2_id) : null,
      sim1_is_official ? 1 : 0,
      sim2_is_official ? 1 : 0,
      status || 'ACTIVO',
      req.user.id,
      deviceTeam
    );

    res.json({ id: result.lastInsertRowid, message: 'Dispositivo guardado correctamente' });

  } catch (err) {
    console.error('Error al guardar dispositivo:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/devices/:id - Editar un dispositivo existente
router.put('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const {
    model,
    internal_name,
    entity,
    assigned_operator_id,
    assigned_operator2_id,
    sim1_phone,
    sim2_phone,
    sim1_id,
    sim2_id,
    sim1_is_official,
    sim2_is_official,
    status,
    team
  } = req.body;

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

    let effectiveSim1Phone = sim1_phone;
    let effectiveSim2Phone = sim2_phone;

    if (sim1_id) {
      const sim1 = simcards.find(s => s.id === Number(sim1_id));
      if (sim1) effectiveSim1Phone = sim1.phone_number;
    }

    if (sim2_id) {
      const sim2 = simcards.find(s => s.id === Number(sim2_id));
      if (sim2) effectiveSim2Phone = sim2.phone_number;
    }

    const phonesToCheck = [
      { phone: effectiveSim1Phone, slot: 'SIM 1' },
      { phone: effectiveSim2Phone, slot: 'SIM 2' }
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

    const updatedTeam = (isAdmin && team) ? team : device.team;

    db.prepare(`
      UPDATE devices 
      SET 
        model = ?, 
        internal_name = ?, 
        entity = ?, 
        assigned_operator_id = ?, 
        assigned_operator2_id = ?, 
        sim1_phone = ?, 
        sim2_phone = ?, 
        sim1_id = ?, 
        sim2_id = ?, 
        sim1_is_official = ?, 
        sim2_is_official = ?, 
        status = ?,
        team = ?
      WHERE id = ?
    `).run(
      model,
      internal_name || null,
      entity || null,
      assigned_operator_id ? Number(assigned_operator_id) : null,
      assigned_operator2_id ? Number(assigned_operator2_id) : null,
      effectiveSim1Phone || null,
      effectiveSim2Phone || 'NO_TIENE',
      sim1_id ? Number(sim1_id) : null,
      sim2_id ? Number(sim2_id) : null,
      sim1_is_official ? 1 : 0,
      sim2_is_official ? 1 : 0,
      status || 'ACTIVO',
      updatedTeam,
      id
    );

    res.json({ message: 'Dispositivo actualizado correctamente' });

  } catch (err) {
    console.error('Error al actualizar dispositivo:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/devices/:id - Eliminar un dispositivo
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
    console.error('Error al eliminar dispositivo:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;