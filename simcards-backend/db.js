const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

// Crea o abre el archivo de la base de datos
const db = new Database('simcards.db');

// Activa el soporte para claves foráneas (relaciones entre tablas)
db.pragma('foreign_keys = ON');

// Crear las tablas si no existen
db.exec(`
  -- Tabla de Usuarios (TLs y Admins)
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT CHECK(role IN ('admin', 'tl')) NOT NULL DEFAULT 'tl',
    campaign TEXT,
    team TEXT
  );

  -- Tabla de SIMCards
  CREATE TABLE IF NOT EXISTS simcards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone_number TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'En stock/Sin uso',
    user_id INTEGER,
    team TEXT,
    campaign TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
  );

  -- Tabla de Historial / Trazabilidad
  CREATE TABLE IF NOT EXISTS sim_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    simcard_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    previous_status TEXT,
    new_status TEXT NOT NULL,
    observation TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (simcard_id) REFERENCES simcards(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  -- Tabla para Cabeceras de Conciliación
  CREATE TABLE IF NOT EXISTS reconciliations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    total_movistar INTEGER,
    matched_count INTEGER,
    orphans_count INTEGER,
    missing_count INTEGER
  );

  -- Tabla para Detalle de Items Conciliados
  CREATE TABLE IF NOT EXISTS reconciliation_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reconciliation_id INTEGER,
    phone_number TEXT,
    status TEXT,
    movistar_plan TEXT,
    movistar_status TEXT,
    app_simcard_id INTEGER,
    FOREIGN KEY (reconciliation_id) REFERENCES reconciliations(id) ON DELETE CASCADE
  );

  -- Tabla de Dispositivos
  CREATE TABLE IF NOT EXISTS devices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model TEXT NOT NULL,
    sim1_phone TEXT,
    sim2_phone TEXT,
    status TEXT DEFAULT 'ACTIVO',
    user_id INTEGER,
    team TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
  );
`);

// Migraciones automáticas para bases de datos existentes
try { db.exec("ALTER TABLE users ADD COLUMN team TEXT;"); } catch (e) {}
try { db.exec("ALTER TABLE simcards ADD COLUMN team TEXT;"); } catch (e) {}
try { db.exec("ALTER TABLE devices ADD COLUMN team TEXT;"); } catch (e) {}

console.log("✅ Base de datos y tablas creadas exitosamente.");

// Función auxiliar para insertar un usuario Admin por defecto
const seedAdmin = () => {
  const adminExists = db.prepare('SELECT * FROM users WHERE email = ?').get('admin@tandem.com');
  
  if (!adminExists) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    db.prepare(`
      INSERT INTO users (name, email, password, role, campaign, team) 
      VALUES (?, ?, ?, ?, ?, ?)
    `).run('Admin General', 'admin@tandem.com', hashedPassword, 'admin', 'Todas', 'General');
    
    console.log("👤 Usuario Admin inicial creado (Email: admin@tandem.com | Pass: admin123)");
  }
};

seedAdmin();

module.exports = db;