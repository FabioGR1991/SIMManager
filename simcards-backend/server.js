const express = require('express');
const cors = require('cors');
const db = require('./db');

// Importamos el router de autenticación y el middleware desde ./routes/auth
const { router: authRouter, authenticateToken } = require('./routes/auth');

const app = express();
const PORT = 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Asegurar que la columna 'team' exista en la tabla devices
try {
  db.prepare("ALTER TABLE devices ADD COLUMN team TEXT").run();
} catch (e) {
  // La columna ya existe
}

// =========================================================================
// RUTAS MODULARES DE LA APLICACIÓN
// =========================================================================
app.use('/api', authRouter);
app.use('/api/simcards', require('./routes/simcards'));
app.use('/api', require('./routes/users'));
app.use('/api/admin', require('./routes/reconciliation'));
app.use('/api/devices', require('./routes/devices'));
app.use('/api/operators', authenticateToken, require('./routes/operators'));

// =========================================================================
// INICIAR SERVIDOR
// =========================================================================
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor backend corriendo en red local: http://192.168.1.101:${PORT}`);
});