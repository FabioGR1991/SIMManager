// migrate.js
const db = require('./db');

console.log('Iniciando migración del Módulo 2...');

const columns = [
  'ALTER TABLE devices ADD COLUMN internal_name TEXT;',
  'ALTER TABLE devices ADD COLUMN entity TEXT;',
  'ALTER TABLE devices ADD COLUMN assigned_operator_id INTEGER REFERENCES operators(id);',
  'ALTER TABLE devices ADD COLUMN sim1_is_official INTEGER DEFAULT 0;',
  'ALTER TABLE devices ADD COLUMN sim2_is_official INTEGER DEFAULT 0;'
];

columns.forEach((sql) => {
  try {
    db.exec(sql);
    console.log('[Éxito] Columna agregada o actualizada.');
  } catch (err) {
    if (err.message.includes('duplicate column name')) {
      console.log('[Omisión] La columna ya existe.');
    } else {
      console.error('Error al agregar columna:', err.message);
    }
  }
});

try {
  db.exec('CREATE INDEX IF NOT EXISTS idx_devices_entity ON devices(entity);');
  db.exec('CREATE INDEX IF NOT EXISTS idx_devices_internal_name ON devices(internal_name);');
  console.log('[Éxito] Índices creados correctamente.');
} catch (err) {
  console.error('Error al crear índices:', err.message);
}

console.log('✅ Migración del Módulo 2 finalizada con éxito.');