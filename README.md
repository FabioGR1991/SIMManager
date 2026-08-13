# 📡 SIMFinity - Documentación Técnica y Arquitectura del Sistema

> **Versión del Documento:** 1.0.0  
> **Estado:** Producción / Desarrollo Activo  
> **Propósito:** Guía central de arquitectura, configuración de entorno, API y flujo de desarrollo para despliegue y mantenimiento del proyecto.

---

## 📋 1. Resumen Ejecutivo
**SIMFinity** es un sistema web integral para la gestión, auditoría e inventario de flotas de **SIM Cards, Dispositivos (Smartphones/Módems) y Operadores**. Permite el seguimiento de estados (Activo, Quemado, Repuesto, Bloqueado, Sin uso), vinculación de líneas a dispositivos/equipos corporativos, asignación por ciudades/equipos de trabajo y conciliación de servicios telefónicos.

---

## ⚙️ 2. Entorno y Requisitos del Sistema

Para evitar errores de compatibilidad al clonar el proyecto en nuevos entornos de desarrollo o producción, se deben respetar las siguientes especificaciones:

* **Node.js:** `^18.x.x` o `^20.x.x` *(Versión LTS recomendada)*.
* **Gestor de Paquetes:** `npm` (`v9.x` o superior).
* **Motor de Base de Datos:** PostgreSQL / MySQL / MariaDB (según corresponda a la API).
* **Variables de Entorno (Frontend):** Requiere archivo `.env` para evitar IPs duras (`192.168.1.x`).

---

## 🗂️ 3. Estructura General del Proyecto (Fullstack)

```text
SIMFinity/
├── frontend/               # Cliente React (Vite / CRA)
│   ├── src/
│   │   ├── components/     # Vistas y componentes de la UI (Sidebar, Modales, Vistas)
│   │   ├── App.jsx         # Estado global, llamadas API y orquestación
│   │   ├── App.css         # Estilos globales y reseteo
│   │   └── main.jsx        # Punto de entrada de React
│   ├── .env                # Variables de entorno del cliente
│   └── package.json
│
└── backend/                # API RESTful (Node.js + Express)
    ├── src/
    │   ├── controllers/    # Lógica de negocio (Users, Sims, Devices, Teams)
    │   ├── routes/         # Definición de rutas API
    │   ├── middlewares/    # Auth (JWT) y validación de roles
    │   ├── config/         # Conexión a Base de Datos (DB Pool)
    │   └── app.js          # Servidor Express y middlewares globales
    ├── .env                # Credenciales DB, JWT Secret, Puerto
    └── package.json
```

---

## 💻 4. Arquitectura del Frontend (React Client)

### **Tech Stack**
* **Librería:** React.js
* **Cliente HTTP:** Axios
* **Iconografía:** `lucide-react`
* **Estilos:** Objetos JavaScript en línea (`style={{...}}`) + `App.css` (Garantiza independencia de frameworks CSS externos).

### **Navegación y Vistas (`App.jsx`)**
El Frontend opera como una **Single Page Application (SPA)** basada en pestañas (`activeTab`):

| Vista Componente | Permisos | Descripción |
| :--- | :--- | :--- |
| **`PanelControlView`** | Todos | Dashboard con métricas globales, alertas de auditoría y accesos express. |
| **`DashboardView`** | Todos | Inventario general de SIM Cards, filtrado por campaña/equipo y cambio de estados. |
| **`DevicesView`** | Todos | Control de dispositivos móviles, slots de SIMs y asignación. |
| **`OperatorsView`** | Todos | Gestión de operadores de campo asociados a la flota. |
| **`TeamsView`** | Admin | ABM de Equipos y asignación de zonas geográficas / ciudades. |
| **`UsersView`** | Admin | Gestión de usuarios del sistema y asignación de roles. |
| **`SyncView`** | Admin | Módulo de conciliación automática con reportes de la proveedora (ej. Movistar). |

---

## 🛢️ 5. Arquitectura del Backend & API REST (Node.js + Express)

### **Tech Stack**
* **Entorno:** Node.js + Express.js
* **Seguridad:** `jsonwebtoken` (JWT) + `bcryptjs` (Hashing de contraseñas) + `cors`
* **Persistencia:** Driver SQL (ej. `pg` / `mysql2` / Sequelize / Prisma)

### **Modelo de Entidades (Base de Datos)**

```text
 [ Users ] ──── (Pertenece a) ────> [ Teams / Ciudades ]
    │                                       │
    ▼                                       ▼
 [ Roles ]                           [ Devices ] ─── (Slot 1 / Slot 2) ───> [ SIMCards ]
                                            │                                  │
                                            ▼                                  ▼
                                     [ Operators ]                      [ SIM_Logs ]
```

### **Catálogo de Endpoints de la API**

#### 🔓 **Autenticación**
* `POST /api/login` → Autentica credenciales y retorna Token JWT + datos de usuario.

#### 📱 **Gestión de SIM Cards (`/api/simcards`)**
* `GET /api/simcards` → Lista todas las SIMs (filtradas según rol del usuario).
* `POST /api/simcards` → Registra una nueva SIMCard.
* `PUT /api/simcards/:id` → Cambia estado de la SIM (ej. 'Repuesto', 'Quemado') con observación.
* `PUT /api/simcards/edit/:id` → Edita número, campaña, equipo y enlaces de WhatsApp.
* `DELETE /api/simcards/:id` → Elimina una SIM del sistema.
* `GET /api/simcards/:id/logs` → Obtiene el historial de auditoría de una SIM.

#### 📱 **Dispositivos (`/api/devices`)**
* `GET /api/devices` → Lista dispositivos físicos y el estado de sus slots SIM.

#### 👤 **Usuarios y Equipos (`/api/users`, `/api/teams`, `/api/operators`)**
* `GET /api/users` *(Admin)* → Lista de usuarios del sistema.
* `POST /api/users` *(Admin)* → Crea nuevo usuario.
* `PUT /api/users/:id` *(Admin)* → Actualiza datos/roles.
* `DELETE /api/users/:id` *(Admin)* → Elimina usuario.
* `GET /api/teams` → Lista de equipos/ciudades registradas.
* `GET /api/operators` → Lista de operadores de campo.

---

## 🔐 6. Seguridad y Control de Acceso (RBAC)

La aplicación implementa control de acceso basado en roles (**Role-Based Access Control**):

1. **`admin` / `Administrador`:**
   * Acceso total a todas las vistas, métricas globales, conciliación, creación de usuarios y borrado de registros.
2. **`pl` / `Planificador`:**
   * Vista acotada a los datos pertenecientes a su equipo/ciudad asignada (`user.team`).
3. **`tl` / `Team Lead`:**
   * Control sobre dispositivos y operadores bajo su supervisión directa.

---

## 🚀 7. Guía de Configuración y Despliegue Local

### **Paso 1: Variables de Entorno**

Crear un archivo `.env` en la raíz del **Frontend**:
```env
VITE_API_URL=http://localhost:3001/api
```

Crear un archivo `.env` en la raíz del **Backend**:
```env
PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASS=secret
DB_NAME=simfinity_db
JWT_SECRET=super_secreto_key_123
```

### **Paso 2: Instalación de Dependencias**

```bash
# En la carpeta del Backend
cd backend
npm install

# En la carpeta del Frontend
cd ../frontend
npm install
```

### **Paso 3: Ejecución en Desarrollo**

```bash
# Servidor de API (Backend)
cd backend
npm run dev

# Cliente Web (Frontend)
cd frontend
npm run dev
```

---

## 🛠️ 8. Deuda Técnica y Buenas Prácticas Pendientes (Roadmap)

- [ ] **Migrar IP hardcodeada en React:** Reemplazar `const API_URL = 'http://192.168.1.101:3001/api'` por `import.meta.env.VITE_API_URL` para que funcione dinámicamente en cualquier red o servidor.
- [ ] **Manejo de Errores Global:** Implementar un *Toast Notifications System* (ej: `react-hot-toast`) en lugar de usar `alert()` nativos del navegador.
- [ ] **Archivo `.nvmrc`:** Agregar archivo `.nvmrc` indicando la versión fija de Node.js (ej. `20.11.0`) para sincronizar el entorno entre todos los desarrolladores.