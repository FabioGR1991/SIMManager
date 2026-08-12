// export-sims.js
const fs = require('fs');
const path = require('path');
const db = require('./db');

console.log('🔄 Iniciando exportación de líneas...');

try {
  // Consulta SQL para obtener todas las columnas de la tabla + usuario + dispositivo
  const rows = db.prepare(`
    SELECT 
      s.id AS id,
      s.phone_number AS numero_linea,
      COALESCE(s.wa_type, '-') AS whatsapp_tipo,
      COALESCE(s.wa_link, '-') AS whatsapp_link,
      COALESCE(s.campaign, 'General') AS campaña,
      COALESCE(s.team, u.team, 'Sin Asignar') AS equipo_sede,
      COALESCE(s.status, 'En stock/Sin uso') AS estado_actual,
      COALESCE(u.name, '-') AS usuario_asignado,
      COALESCE(d.model, '-') AS dispositivo_asignado
    FROM simcards s
    LEFT JOIN users u ON s.user_id = u.id
    LEFT JOIN devices d ON (s.phone_number = d.sim1_phone OR s.phone_number = d.sim2_phone)
    ORDER BY s.id ASC
  `).all();

  if (rows.length === 0) {
    console.log('⚠️ No hay líneas registradas para exportar.');
    process.exit(0);
  }

  // Encabezados del CSV
  const headers = [
    'ID',
    'Número de Línea',
    'WhatsApp Tipo',
    'WhatsApp Link',
    'Campaña',
    'Equipo / Sede',
    'Estado Actual',
    'Usuario Asignado',
    'Dispositivo Asignado'
  ];

  // Convertir filas a formato CSV con delimitador de punto y coma ';' (estándar de Excel en español)
  const csvLines = [
    headers.join(';'),
    ...rows.map(row => [
      row.id,
      `"${row.numero_linea}"`,
      `"${row.whatsapp_tipo}"`,
      `"${row.whatsapp_link}"`,
      `"${row.campaña}"`,
      `"${row.equipo_sede}"`,
      `"${row.estado_actual}"`,
      `"${row.usuario_asignado}"`,
      `"${row.dispositivo_asignado}"`
    ].join(';'))
  ];

  const outputPath = path.join(__dirname, 'lineas_exportadas.csv');
  
  // Guardar archivo con BOM (\uFEFF) para que Excel reconozca los acentos y caracteres especiales automáticamente
  fs.writeFileSync(outputPath, '\uFEFF' + csvLines.join('\n'), 'utf8');

  console.log(`✅ Exportación completada con éxito.`);
  console.log(`📁 Archivo generado: ${outputPath}`);
  console.log(`📊 Total de líneas exportadas: ${rows.length}`);

} catch (err) {
  console.error('❌ Error durante la exportación:', err.message);
}