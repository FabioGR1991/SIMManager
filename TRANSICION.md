```markdown
# TRANSICION.md

📐 **Manual de Transición y Traspaso de Proyecto: SIMfinity**  
*Este documento establece la línea base técnica, la hoja de ruta y las directrices de entorno para la metodología de desarrollo basada en Stitch, Gemini y Antigravity.*

---

## 🔄 Flujo de Trabajo Integrado (Ciclo de Vida de Features)

Para cada nueva funcionalidad o modificación en el sistema, se seguirá estrictamente el siguiente pipeline secuencial:


```

[ 1. Stitch ] ➔ [ 2. Gemini ] ➔ [ 3. Antigravity ]
Maquetado / UI    Lógica & Backend    Testing & Despliegue

```

1. **Stitch (Diseño y UI):** Prototipado interactivo, layout y definición visual del componente.
2. **Gemini (Arquitectura y Código):** Definición de reglas de negocio, endpoints en Node.js, componentes en React y consultas en SQLite.
3. **Antigravity (Automatización y DevOps):** Ejecución de scripts de prueba E2E, compilación del frontend y reinicio de procesos en el servidor.

---

## 📌 Estado Actual y Arquitectura

* **Propósito del Sistema:** Gestión de tarjetas SIM (chips), asignaciones a equipos/sedes, control de estados (*activa, quemada, repuesto, bloqueada*) y auditoría de cambios para despliegue en la intranet corporativa.
* **Stack Tecnológico:**
  * **Frontend:** React + Vite (`simcards-app`) sirviendo interfaz estática.
  * **Backend:** Node.js + Express (`simcards-backend`), endurecido con Helmet, Rate Limiting y CORS.
  * **Base de Datos:** SQLite (`/simcards-backend/data/simcards.db`) persistida en disco.
  * **Servidor / Proceso:** Windows Server (IP `192.168.1.101:3001`), orquestado en segundo plano con PM2 y script de arranque automático en `shell:startup`.
* **Punto de Avance Actual:**
  * Aplicación unificada y desplegada en producción sobre la red local.
  * Autenticación y roles (Admin / Usuario) funcionales.
  * Documentación de mantenimiento creada (`DEPLOYMENT.md`).
  * *Pendiente de integración:* Acción de **Override / Baja y Reemplazo (Movistar)** exclusiva para administradores.

---

## 🎨 Capa 1: UI y Frontend para Stitch
*Pantallas y componentes a diseñar o re-maquetar en Stitch antes de implementar en código React:*

* **Modal de Override "Baja y Reemplazo Directo (Movistar)":**
  * Formulario emergente para administradores que capture el nuevo ICCID, motivo de reemplazo directo y observaciones.
  * Badge y alerta visual de confirmación para evitar cambios accidental en el desplegable de acciones.
* **Dashboard de Métricas e Inventario:**
  * Rediseño del panel principal con tarjetas de estado (*Total SIMs, En Stock, Bloqueadas, Quemadas y Reemplazadas por Movistar*).
* **Módulo de Auditoría y Logs:**
  * Vista de tabla detallada para consultar el historial de cambios por SIM, identificando qué usuario realizó cada movimiento y la fecha exacta.
* **Vista Móvil / Responsive para Operadores de Campo:**
  * Adaptación maquetada para consultas y cambios rápidos de estado desde dispositivos móviles en la intranet.

---

## 🧠 Capa 2: Lógica Central y Reglas para Gemini
*Estructura de API, reglas de negocio y endpoints que se mantendrán y refinarán directamente en la arquitectura backend:*

* **Endpoint de Override de Estado (Admin Only):**
  * `PATCH /api/simcards/:id/estado`
  * *Regla de negocio:* Validar que si el estado enviado es `'Baja y Reemplazo (Movistar)'`, el token JWT pertenezca a `role === 'admin'`. Retornar `403 Forbidden` en caso contrario.
* **Modelo de Transacciones e Historial:**
  * Registrar en la tabla de auditoría (`audit_logs`) cada cambio de estado, asociando `simcard_id`, `user_id`, `previous_state`, `new_state` y `timestamp`.
* **Control de Duplicidad de ICCID / Número de Línea:**
  * Validaciones de unicidad en SQLite al reasignar una nueva SIM tras un reemplazo de Movistar.
* **Módulo de Conciliación (`routes/reconciliation.js`):**
  * Lógica para cruzar reportes masivos enviados por la operadora contra la base de datos local.

---

## 🤖 Capa 3: Tareas de Automatización para Antigravity
*Scripts, agentes autónomos y tareas repetitivas de verificación y despliegue a delegar:*

> ⚠️ **Especificación de Entorno Server:** Todos los scripts de automatización deben ejecutarse dentro del entorno **PowerShell / CMD de Windows Server** (IP `192.168.1.101`). Asegurar compatibilidad de sintaxis para rutas nativas de Windows (`\`) y alias de PM2 sobre Node.js Windows.

* **Pipeline de Despliegue Automático (Local CD):**
  * Agente encargado de ejecutar en secuencia tras un commit sobre Windows PowerShell:
    ```powershell
    cd simcards-app
    npm run build
    npx pm2 restart SIMfinity
    npx pm2 save
    ```
* **Pruebas Integrales de Endpoint y Seguridad:**
  * Script ejecutable de pruebas E2E/API que verifique:
    1. Intento de cambiar estado a *Baja y Reemplazo* con un token de usuario estándar (debe fallar con `403`).
    2. Éxito de la operación con token de administrador.
    3. Persistencia correcta en la base de datos SQLite.
* **Agente de Respaldo y Verificación de DB:**
  * Script automatizado para respaldar periódicamente `simcards.db` en una ruta externa/disco de backup de Windows y comprobar la integridad física del archivo SQLite (`PRAGMA integrity_check;`).
* **Monitoreo y Alertas de PM2:**
  * Tarea autónoma que revise el estado de PM2 (`npx pm2 jlist`) y reintente el comando `npx pm2 resurrect` o notifique si el proceso entra en estado de reinicio infinito (`errored`).

```