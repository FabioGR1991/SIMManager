# 🗺️ ROADMAP DE FUNCIONALIDADES - SIMCARDS APP

---

## ~~🟢 Módulo 1: WhatsApp en SIMCards (Editar SIM)~~
**Estado:** [x] Completado

### ~~1. Base de Datos (`simcards.db`)~~
- ~~Columnas `wa_type` (`'Comun'`, `'Business'`, `NULL`) y `wa_link` en tabla `simcards`.~~

### ~~2. Backend (`routes/simcards.js`)~~
- ~~Endpoints `POST` / `PUT` / `GET` adaptados para persisting/recuperar tipo y enlace de WA.~~

### ~~3. Frontend (`App.jsx` / `SimEditModal.jsx`)~~
- ~~Campos desplegables de tipo y link dinámico de WhatsApp con reseteo de seguridad.~~

### ~~4. Impacto / Integraciones~~
- ~~Ícono e interacción directa de WhatsApp en las vistas de tabla de SIMs.~~

---

## ~~🔵 Módulo 2: Edición Ampliada de Dispositivos (Celulares)~~
**Estado:** [x] Completado

### ~~1. Base de Datos (`simcards.db`)~~
- ~~Campos `internal_name`, `entity`, `assigned_operator_id`, `assigned_operator2_id`, `sim1_is_official` y `sim2_is_official` en `devices`.~~

### ~~2. Backend (`routes/devices.js`)~~
- ~~Endpoints de dispositivos adaptados con `LEFT JOIN` hacia `simcards` y `operators`.~~

### ~~3. Frontend (`DeviceEditModal.jsx`)~~
- ~~Rediseño visual a 2 columnas con asignación de SIMs, banderas de oficiales, operadores y enlaces a WA.~~

---

## ~~🟣 Módulo 3: Búsqueda, Filtros e Índices en Dispositivos~~
**Estado:** [x] Completado

### ~~1. Base de Datos (`simcards.db`)~~
- ~~Índices de rendimiento en `model`, `internal_name` y `entity` (`idx_devices_entity`, `idx_devices_internal_name`).~~

### ~~2. Backend (`routes/devices.js`)~~
- ~~Soporte de query params (`?q=`, `?status=`, `?entity=`) para búsquedas multicriterio.~~

### ~~3. Frontend (`DevicesView.jsx`)~~
- ~~Barra de búsqueda, selectores de estado/entidad, botón de limpieza de filtros y tarjetas informativas.~~

---

## ~~🟣 Módulo 3.5: Ficha Destacada y Modal "+ Info" (Solo Lectura)~~
**Estado:** [x] Completado

### ~~1. Frontend (`DevicesView.jsx` / `DeviceInfoModal.jsx`)~~
- ~~Ficha superior con renderizado inteligente de operadores (unificado o dual).~~
- ~~Modal de lectura a 2 columnas con copia de enlace WA en un clic sin riesgo de alteración.~~

---

## ~~🟡 Módulo 4: Gestión de Operadores~~
**Estado:** [x] Completado

### ~~1. Arquitectura & Base de Datos~~
- ~~Tabla `operators` con aislamiento total por equipo (`team`) y relación `SET NULL` en `devices`.~~

### ~~2. Backend (`routes/operators.js`)~~
- ~~CRUD completo de operadores aislado por equipo del TL autenticado.~~

### ~~3. Frontend (`OperatorsView.jsx` & `Sidebar.jsx`)~~
- ~~Sección de operadores, vista destacada del operador seleccionado con sus dispositivos y modal de creación/edición.~~

---

## ~~🔐 Módulo 5: Autenticación, Usuarios y Control de Acceso~~
**Estado:** [x] Completado

### ~~1. Autenticación JWT (`routes/auth.js`)~~
- ~~Endpoint `POST /api/auth/login` con encriptación bcrypt y firma JWT.~~
- ~~Middleware `authenticateToken` con validación dinámica en base de datos para rol, campaña y equipo actualizados.~~
- ~~Endpoint `GET /api/auth/me` para sincronización de sesión en el cliente.~~

### ~~2. Gestión de Usuarios y Equipos (`routes/users.js`)~~
- ~~CRUD de usuarios restringido a administradores (`GET`, `POST`, `PUT`, `DELETE /api/users`).~~
- ~~Protección anti-autoborrado de usuario admin activo.~~
- ~~Endpoint `GET /api/teams` con deduplicación de equipos (`users` + `devices`).~~

---

## ~~🔄 Módulo 6: Motor de Conciliación y Crosscheck Movistar~~
**Estado:** [x] Completado

### ~~1. Base de Datos (`simcards.db`)~~
- ~~Tablas `reconciliations` y `reconciliation_items` para auditorías de inventario.~~

### ~~2. Backend (`routes/reconciliation.js`)~~
- ~~Endpoint `POST /api/admin/sync`: Cruce transaccional entre export de Movistar y la BD app.~~
- ~~Normalización telefónica (`normalizePhone`) y categorización de estados: `MATCHED`, `ORPHAN_MOVISTAR` y `MISSING_MOVISTAR`.~~
- ~~Endpoint `GET /api/admin/sync/:id`: Histórico y detalle de auditoría cruzada con campañas y estados de SIMs.~~


---

## 📖 ¿Cómo funciona SIMCards App?

**SIMCards App** es una plataforma centralizada de inventario, auditoría y gestión operativa del parque de telefonía celular y líneas móviles de la organización. Su objetivo principal es unir en un solo ecosistema el hardware (dispositivos), la conectividad (SIM Cards y enlaces de WhatsApp) y el capital humano (operadores y Team Leaders).

### 1. Control Operativo y Trazabilidad de Dispositivos

La aplicación permite administrar los teléfonos celulares del inventario registrando su modelo, nombre interno, entidad asignada y estado (Activo, Reserva, Reparación, Inactivo). Cada dispositivo admite la asignación de hasta dos tarjetas SIM (Soporte Dual-SIM), permitiendo marcar cuáles corresponden a líneas oficiales y vinculando directamente los datos de WhatsApp (Común o Business) con accesos de un solo clic a enlaces `wa.me` para agilizar las comunicaciones de los equipos.

### 2. Gestión Aislada de Operadores

Los operadores son los usuarios finales que utilizan las líneas. El módulo de operadores funciona de manera independiente al hardware: un operador pertenece a un equipo (*team*) y turno específico. Al ser asignado a una SIM dentro de un dispositivo, la aplicación vincula dinámicamente sus datos; si el operador se da de baja o cambia de campaña, el dispositivo y las tarjetas SIM permanecen intactos en la base de datos (`SET NULL`), previniendo pérdidas de información o desconfiguraciones del inventario.

### 3. Búsqueda Rápida y Fichas de Vista Rápida

Para resolver consultas en segundos, la vista principal de dispositivos incluye un motor de búsqueda y filtrado multicriterio (por texto libre, estado o entidad). Además, la aplicación dispone de una ficha de consulta de solo lectura (*+ Info*) que resume la hoja de vida del dispositivo y los operadores asignados, permitiendo copiar enlaces de WhatsApp al portapapeles sin riesgo de editar o borrar datos por error.

### 4. Autenticación y Control de Acceso por Roles

La seguridad de la plataforma está basada en tokens encriptados (JWT). Existen dos roles principales:

* **Team Leader (TL):** Acceso acotado exclusivamente a la información, dispositivos y operadores de su propio equipo/campaña.
* **Administrador:** Control total del sistema, con capacidad para gestionar usuarios (crear, editar, asignar roles o revocar accesos) y ejecutar auditorías avanzadas.

### 5. Motor de Auditoría y Conciliación (Crosscheck Movistar)

Para evitar desvíos en los costos de facturación o líneas inactivas cobradas por la compañía telefónica, la app incluye un motor transaccional de conciliación. El administrador sube el listado de líneas proveído por la prestadora (Movistar) y el sistema realiza un cruce masivo contra la base de datos interna, categorizando cada número en tres estados:

* **MATCHED:** La línea existe tanto en Movistar como en el inventario de la app.
* **ORPHAN_MOVISTAR:** La línea figura activa en la facturación de Movistar pero no existe en el sistema interno.
* **MISSING_MOVISTAR:** La línea está registrada en el inventario de la app pero no aparece en el informe de Movistar.