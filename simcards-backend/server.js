const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const db = require('./db');

const PORT = process.env.PORT || 3001;

// Importamos el router de autenticación y el middleware desde ./routes/auth
const { router: authRouter, authenticateToken } = require('./routes/auth');

const app = express();

// =========================================================================
// MIDDLEWARES DE SEGURIDAD Y HARDENING
// =========================================================================

// Helmet: Cabeceras HTTP de seguridad
app.use(helmet({
  contentSecurityPolicy: false // Desactivado para evitar bloqueos de assets locales en la intranet
}));

// CORS Restringido: Permite peticiones de la red local y localhost
const allowedOrigins = [
  /^http:\/\/localhost:\d+$/,
  /^http:\/\/127\.0\.0\.1:\d+$/,
  /^http:\/\/192\.168\.1\.\d+(:\d+)?$/,
  /^http:\/\/172\.16\.20\.\d+(:\d+)?$/
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.some(regex => regex.test(origin));
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true
}));

app.use(express.json());

// Limitador de tasa (Rate Limiting) para prevenir ataques de fuerza bruta
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Ventana de 15 minutos
  max: 10, // Máximo 10 intentos por IP
  message: { error: 'Demasiados intentos de inicio de sesión. Intente nuevamente en 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// =========================================================================
// MIGRACIONES DE BASE DE DATOS
// =========================================================================
try {
  db.prepare("ALTER TABLE devices ADD COLUMN team TEXT").run();
} catch (e) {
  // La columna ya existe
}

// =========================================================================
// RUTAS DE LA API RESTful
// =========================================================================
app.use('/api/login', authLimiter);

app.use('/api', authRouter);
app.use('/api/simcards', require('./routes/simcards'));
app.use('/api', require('./routes/users'));
app.use('/api/admin', require('./routes/reconciliation'));
app.use('/api/devices', require('./routes/devices'));
app.use('/api/operators', authenticateToken, require('./routes/operators'));

// =========================================================================
// ENTREGA DEL FRONTEND COMPILADO (REACT / VITE)
// =========================================================================
const distPath = path.join(__dirname, '../simcards-app/dist');

// Servir archivos estáticos del build de React
app.use(express.static(distPath));

// Enrutamiento Catch-All (SPA): Redirecciona cualquier otra petición al index.html
app.use((req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// =========================================================================
// INICIAR SERVIDOR UNIFICADO
// =========================================================================
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor unificado corriendo en:`);
  console.log(`   - Local:    http://localhost:${PORT}`);
  console.log(`   - Intranet: http://192.168.1.101:${PORT}`);
});