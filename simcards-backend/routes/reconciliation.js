const express = require('express');
const router = express.Router();
const db = require('../db');
const { normalizePhone } = require('../utils/helpers');

// POST /api/admin/sync
router.post('/sync', (req, res) => {
  const { movistarLines } = req.body;

  if (!Array.isArray(movistarLines) || movistarLines.length === 0) {
    return res.status(400).json({ error: 'No se enviaron datos válidos.' });
  }

  try {
    const appSims = db.prepare('SELECT id, phone_number, campaign, status FROM simcards').all();

    const appMap = new Map();
    appSims.forEach(sim => appMap.set(normalizePhone(sim.phone_number), sim));

    const movistarMap = new Map();
    movistarLines.forEach(line => movistarMap.set(normalizePhone(line.phone), line));

    const itemsToInsert = [];
    let matchedCount = 0;
    let orphansCount = 0;
    let missingCount = 0;

    movistarLines.forEach(mov => {
      const cleanPhone = normalizePhone(mov.phone);
      if (!cleanPhone) return;

      const appSim = appMap.get(cleanPhone);
      if (appSim) {
        matchedCount++;
        itemsToInsert.push({
          phone: mov.phone,
          status: 'MATCHED',
          plan: mov.plan || '',
          movStatus: mov.status || '',
          simId: appSim.id
        });
      } else {
        orphansCount++;
        itemsToInsert.push({
          phone: mov.phone,
          status: 'ORPHAN_MOVISTAR',
          plan: mov.plan || '',
          movStatus: mov.status || '',
          simId: null
        });
      }
    });

    appSims.forEach(sim => {
      const cleanPhone = normalizePhone(sim.phone_number);
      if (cleanPhone && !movistarMap.has(cleanPhone)) {
        missingCount++;
        itemsToInsert.push({
          phone: sim.phone_number,
          status: 'MISSING_MOVISTAR',
          plan: 'N/A',
          movStatus: 'N/A',
          simId: sim.id
        });
      }
    });

    const insertReconciliation = db.prepare(`
      INSERT INTO reconciliations (total_movistar, matched_count, orphans_count, missing_count) 
      VALUES (?, ?, ?, ?)
    `);

    const info = insertReconciliation.run(movistarLines.length, matchedCount, orphansCount, missingCount);
    const reconciliationId = info.lastInsertRowid;

    const insertItem = db.prepare(`
      INSERT INTO reconciliation_items (reconciliation_id, phone_number, status, movistar_plan, movistar_status, app_simcard_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((items) => {
      for (const item of items) {
        insertItem.run(reconciliationId, item.phone, item.status, item.plan, item.movStatus, item.simId);
      }
    });

    insertMany(itemsToInsert);

    res.json({
      reconciliationId,
      summary: { total: movistarLines.length, matchedCount, orphansCount, missingCount }
    });

  } catch (err) {
    console.error('Error en sync:', err);
    res.status(500).json({ error: 'Error al procesar el crosscheck.' });
  }
});

// GET /api/admin/sync/:id
router.get('/sync/:id', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT i.*, s.campaign as app_campaign, s.status as app_status
      FROM reconciliation_items i
      LEFT JOIN simcards s ON i.app_simcard_id = s.id
      WHERE i.reconciliation_id = ?
    `).all(req.params.id);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;