const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const db = new Database('simcards.db');
db.pragma('foreign_keys = ON');

db.exec(`
  -- Tabla de Equipos / Ciudades
  CREATE TABLE IF NOT EXISTS teams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
  );

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

  -- Tabla de Operadores
  CREATE TABLE IF NOT EXISTS operators (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    shift TEXT NOT NULL,
    campaign TEXT,
    team_id INTEGER,
    team TEXT,
    status TEXT DEFAULT 'ACTIVO',
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL
  );

  -- Tabla de SIMCards
  CREATE TABLE IF NOT EXISTS simcards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone_number TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'En stock/Sin uso',
    user_id INTEGER,
    team TEXT,
    campaign TEXT,
    wa_type TEXT,
    wa_link TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
  );

  -- Tabla de Historial / Trazabilidad de SIMCards
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
    internal_name TEXT,
    entity TEXT,
    sim1_phone TEXT,
    sim2_phone TEXT,
    sim1_id INTEGER,
    sim2_id INTEGER,
    sim1_is_official INTEGER DEFAULT 0,
    sim2_is_official INTEGER DEFAULT 0,
    status TEXT DEFAULT 'ACTIVO',
    user_id INTEGER,
    team TEXT,
    assigned_operator_id INTEGER,
    assigned_operator2_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_operator_id) REFERENCES operators(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_operator2_id) REFERENCES operators(id) ON DELETE SET NULL,
    FOREIGN KEY (sim1_id) REFERENCES simcards(id) ON DELETE SET NULL,
    FOREIGN KEY (sim2_id) REFERENCES simcards(id) ON DELETE SET NULL
  );

  -- Tabla de Historial / Trazabilidad de Dispositivos
  CREATE TABLE IF NOT EXISTS device_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id INTEGER NOT NULL,
    user_id INTEGER,
    action TEXT NOT NULL,
    details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
  );

  -- Índices de optimización
  CREATE INDEX IF NOT EXISTS idx_devices_model ON devices(model);
  CREATE INDEX IF NOT EXISTS idx_devices_internal_name ON devices(internal_name);
  CREATE INDEX IF NOT EXISTS idx_devices_entity ON devices(entity);
  CREATE INDEX IF NOT EXISTS idx_device_logs_device_id ON device_logs(device_id);
`);

// Migraciones automáticas
try { db.exec("ALTER TABLE users ADD COLUMN team TEXT;"); } catch (e) {}
try { db.exec("ALTER TABLE simcards ADD COLUMN team TEXT;"); } catch (e) {}
try { db.exec("ALTER TABLE simcards ADD COLUMN wa_type TEXT;"); } catch (e) {}
try { db.exec("ALTER TABLE simcards ADD COLUMN wa_link TEXT;"); } catch (e) {}
try { db.exec("ALTER TABLE devices ADD COLUMN team TEXT;"); } catch (e) {}
try { db.exec("ALTER TABLE devices ADD COLUMN assigned_operator_id INTEGER;"); } catch (e) {}
try { db.exec("ALTER TABLE devices ADD COLUMN assigned_operator2_id INTEGER;"); } catch (e) {}
try { db.exec("ALTER TABLE devices ADD COLUMN sim1_phone TEXT;"); } catch (e) {}
try { db.exec("ALTER TABLE devices ADD COLUMN sim2_phone TEXT;"); } catch (e) {}
try { db.exec("ALTER TABLE devices ADD COLUMN internal_name TEXT;"); } catch (e) {}
try { db.exec("ALTER TABLE devices ADD COLUMN entity TEXT;"); } catch (e) {}
try { db.exec("ALTER TABLE devices ADD COLUMN sim1_id INTEGER;"); } catch (e) {}
try { db.exec("ALTER TABLE devices ADD COLUMN sim2_id INTEGER;"); } catch (e) {}
try { db.exec("ALTER TABLE devices ADD COLUMN sim1_is_official INTEGER DEFAULT 0;"); } catch (e) {}
try { db.exec("ALTER TABLE devices ADD COLUMN sim2_is_official INTEGER DEFAULT 0;"); } catch (e) {}
try { db.exec("ALTER TABLE operators ADD COLUMN team TEXT;"); } catch (e) {}

console.log("✅ Base de datos, tablas e índices creados/actualizados exitosamente.");

const seedAdmin = () => {
  const adminExists = db.prepare('SELECT * FROM users WHERE email = ?').get('admin@tandem.com');
  if (!adminExists) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    db.prepare(`
      INSERT INTO users (name, email, password, role, campaign, team) 
      VALUES (?, ?, ?, ?, ?, ?)
    `).run('Admin General', 'admin@tandem.com', hashedPassword, 'admin', 'Todas', 'General');
    console.log("👤 Usuario Admin inicial creado.");
  }
};

seedAdmin();

module.exports = db;