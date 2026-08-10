// migrate.js
const db = require('./db'); // Ajusta la ruta a tu conexión db.js

console.log('Iniciando migración del Módulo 2...');

db.serialize(() => {
  // Ejecutar los ALTER TABLE uno por uno (SQLite requiere una sentencia por columna)
  const columns = [
    'ALTER TABLE devices ADD COLUMN internal_name TEXT;',
    'ALTER TABLE devices ADD COLUMN entity TEXT;',
    'ALTER TABLE devices ADD COLUMN assigned_operator_id INTEGER REFERENCES operators(id);',
    'ALTER TABLE devices ADD COLUMN sim1_is_official INTEGER DEFAULT 0;',
    'ALTER TABLE devices ADD COLUMN sim2_is_official INTEGER DEFAULT 0;'
  ];

  columns.forEach((sql) => {
    db.run(sql, (err) => {
      if (err) {
        // Ignoramos el error si la columna ya existe
        if (err.message.includes('duplicate column name')) {
          console.log(`[Omisión] La columna ya existe.`);
        } else {
          console.error('Error al agregar columna:', err.message);
        }
      } else {
        console.log('[Éxito] Columna agregada.');
      }
    });
  });

  // Crear índices
  db.run('CREATE INDEX IF NOT EXISTS idx_devices_entity ON devices(entity);');
  db.run('CREATE INDEX IF NOT EXISTS idx_devices_internal_name ON devices(internal_name);', (err) => {
    if (err) {
      console.error('Error al crear índices:', err.message);
    } else {
      console.log('[Éxito] Índices creados correctamente.');
    }
    console.log('Migración finalizada.');
  });
});