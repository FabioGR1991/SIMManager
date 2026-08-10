# 🗺️ ROADMAP DE FUNCIONALIDADES - SIMCARDS APP

---

## 🟢 Módulo 1: WhatsApp en SIMCards (Editar SIM)
**Estado:** [ ] Pendiente | [ ] En Progreso | [ ] Completado

### 1. Base de Datos (`simcards.db`)
- Agregar columna `wa_type` (`TEXT`: `'Comun'`, `'Business'`, `NULL`) a la tabla `simcards`.
- Agregar columna `wa_link` (`TEXT`: enlace `https://wa.me/...`, `NULL`) a la tabla `simcards`.

### 2. Backend (`routes/simcards.js`)
- Modificar el endpoint `PUT /api/simcards/:id` para recibir y guardar `wa_type` y `wa_link`.
- Ajustar los endpoints `GET /api/simcards` y conciliación para incluir estas variables en la respuesta JSON.

### 3. Frontend (`SimEditModal.jsx`)
- Agregar el campo desplegable **Tipo de WhatsApp** (`-- Seleccionar --`, `Comun`, `Business`).
- Agregar el campo de texto **Link de WhatsApp** (deshabilitado hasta elegir tipo).
- Lógica de reseteo: si se vuelve a `-- Seleccionar --`, limpiar el campo de texto.

### 4. Impacto / Integraciones
- **Vista de Tabla SIMs (`DashboardView.jsx` / `SyncView.jsx`)**: Mostrar ícono de WhatsApp en la celda con el enlace clickeable si la línea tiene WhatsApp configurado.
- **Filtros**: (Opcional) Poder filtrar SIMs por "Con WhatsApp", "Sin WhatsApp", "Business" o "Comun".

---

## 🟡 Módulo 2: [Próxima Funcionalidad]
**Estado:** [ ] Pendiente

### 1. Base de Datos
- ...

### 2. Backend
- ...

### 3. Frontend
- ...

### 4. Impacto / Integraciones
- ...

---

## 🟡 Módulo 3: [Siguiente Funcionalidad]
**Estado:** [ ] Pendiente


/////////////////////////////////////////////////////////////////////////


---

## 🔵 Módulo 2: Edición Ampliada de Dispositivos (Celulares)
**Estado:** [ ] Pendiente | [ ] En Progreso | [ ] Completado

### 1. Base de Datos (`simcards.db`)
- Modificar tabla `devices` para incluir:
  - `internal_name` (`TEXT`): Nombre interno para comunicación del equipo.
  - `entity` (`TEXT`): Entidad/Área asignada (campo indexado para búsquedas rápidas).
  - `assigned_operator_id` (`INTEGER`): ID de la tabla `operators` (llave foránea).
  - *(Opcional)* `sim1_is_official` y `sim2_is_official` (`INTEGER/BOOLEAN`): Indicador de casilla "Oficial".

### 2. Backend (`routes/devices.js`)
- Modificar `GET /api/devices`:
  - Hacer `LEFT JOIN` con la tabla `simcards` para traer los datos de las SIMs asignadas (incluyendo `wa_type` y `wa_link`).
  - Hacer `LEFT JOIN` con la tabla `operators` para traer el nombre del operador asignado.
- Modificar `PUT /api/devices/:id`:
  - Guardar `internal_name`, `entity`, `assigned_operator_id`, `status`, `sim1_id`, `sim2_id`.

### 3. Frontend (`DeviceEditModal.jsx`)
- **Rediseño visual a 2 columnas:**
  - **Columna Izquierda:**
    - Modelo / Nombre (`input`)
    - Entidad (`input`)
    - Sim 1 (`Select/Searchable`) + Checkbox "Oficial"
      - *Sección dinámicas:* Si la SIM elegida tiene `wa_link`, mostrar la URL y el botón de copiar en un clic (`clipboard`).
    - Sim 2 (`Select/Searchable`) + Checkbox "Oficial"
      - *Sección dinámica:* Muestra link de WA + botón de copiar.
  - **Columna Derecha:**
    - Nombre interno (`input`)
    - Estado del dispositivo (`dropdown`: ACTIVO, INACTIVO, EN REPARACION, etc.)
    - Operador asignado (`Select/Searchable` alimentado de la base de operadores).

### 4. Dependencias e Impacto
- **Dependencia previa:** Requiere la creación de la tabla/módulo de **Operadores** (Módulo 3) para poblar el dropdown.
- **Buscador en Inventario:** El campo `entity` y `internal_name` servirán como índices para el motor de búsqueda de la tabla de dispositivos.



/////////////////////////////////////////////////////////////////////////


---

## 🟣 Módulo 3: Motor de Búsqueda y Filtros en Dispositivos
**Estado:** [ ] Pendiente | [ ] En Progreso | [ ] Completado

### 1. Base de Datos (`simcards.db`)
- Crear índices en la tabla `devices` para optimizar consultas de texto:
  - Índice en `model`, `internal_name` y `entity`.

### 2. Backend (`routes/devices.js`)
- Actualizar `GET /api/devices` para aceptar parámetros de búsqueda vía query params:
  - `?q=texto`: Filtra en `model`, `internal_name`, `entity`, líneas de `sim1`/`sim2` y nombre de `operator`.
  - `?status=ACTIVO`: Filtro por estado.
  - `?entity=Ventas`: Filtro específico por entidad.

### 3. Frontend (`DevicesView.jsx`)
- Agregar barra de búsqueda rápida con icono de lupa e `input` de filtrado dinámico.
- Agregar selectores desplegables para filtro por **Estado** y **Entidad**.
- Agregar botón de reseteo "Limpiar Filtros".
- Rediseñar levemente las filas de la tabla para mostrar el **Nombre Interno**, la **Entidad** y el **Operador Asignado** debajo o al lado del Modelo.

### 4. Impacto / Integraciones
- **Experiencia de Usuario (UX):** Permite a los TL localizar un dispositivo en menos de 2 segundos aunque solo recuerden el nombre del operador, la entidad o una de las dos SIMs asociadas.



/////////////////////////////////////////////////////////////////////////

---

## 🟣 Módulo 3.5: Ficha Destacada de Dispositivo y Modal "+ Info" (Solo Lectura)
**Estado:** [ ] Pendiente | [ ] En Progreso | [ ] Completado

### 1. Base de Datos (`simcards.db`)
- *(Utiliza los campos creados en los Módulos 1 y 2: `internal_name`, `entity`, `assigned_operator_id`, `wa_link`)*.

### 2. Backend (`routes/devices.js`)
- Asegurar que la respuesta del endpoint `GET /api/devices/:id` (o el listado) devuelva el objeto completo del dispositivo incluyendo:
  - Datos de SIM 1 y SIM 2 con sus enlaces de WhatsApp.
  - Datos de Operador(es) asignado(s).

### 3. Frontend (`DevicesView.jsx` / `DeviceInfoModal.jsx`)
- **Ficha Destacada Superior (Card del Dispositivo seleccionado):**
  - **Visualización inteligente de Operadores:**
    - *Si ambas SIMs tienen el mismo operador (o el dispositivo tiene 1 solo operador asignado):* Mostrar una tarjeta/avatar unificado más destacado con el nombre del operador.
    - *Si las SIMs tienen operadores distintos:* Mostrar un icono compacto con el nombre al lado de cada SIM (SIM 1 y SIM 2).
  - **Botón `+ Info`:** Ubicado en la esquina inferior derecha de la tarjeta superior (estilo botón primario/secundario).
- **Modal de Vista Rápida (`DeviceInfoModal.jsx`):**
  - **Estructura a 2 columnas (Idéntica a la maqueta de "Información de Dispositivo"):**
    - Columna 1: Modelo/Nombre, Entidad, SIM 1 (con link de WA), SIM 2 (con link de WA).
    - Columna 2: Nombre Interno, Estado del dispositivo, Operador(es) asignado(s).
  - **Comportamiento Solo Lectura:**
    - Todos los campos se muestran como texto plano o badges, sin inputs editables.
    - **Única interacción permitida:** Botón de copiar (`clipboard`) para los links de WhatsApp de la SIM 1 y SIM 2.

### 4. Impacto / UX
- Permite a los TL obtener la "Hoja de Vida" completa de un equipo y copiar enlaces de WhatsApp en 1 clic sin riesgo de modificar o borrar información accidentalmente.



/////////////////////////////////////////////////////////////////////////



---

## 🟡 Módulo 4: Gestión de Operadores
**Estado:** [ ] Pendiente | [ ] En Progreso | [ ] Completado

### 1. Regla de Arquitectura (Aislamiento Total)
- Los operadores pertenecen **únicamente** a un equipo (`team_id`).
- No poseen ni arrastran SIMs ni Dispositivos.
- En la base de datos, la relación con `devices` es de tipo `SET NULL`: si un operador es eliminado o editado, **el dispositivo permanece intacto** y solo se vacía su campo de operador asignado.

### 2. Base de Datos (`simcards.db`)
- Crear la tabla `operators`:
  - `id` (`INTEGER PRIMARY KEY AUTOINCREMENT`)
  - `full_name` (`TEXT`): Nombre y Apellido.
  - `shift` (`TEXT`): Turno (Mañana / Tarde / Noche).
  - `campaign` (`TEXT`): Campaña/s asignadas.
  - `team_id` (`INTEGER`): ID del equipo al que pertenece (aislado por TL).
  - `status` (`TEXT`): Estado (`ACTIVO` / `INACTIVO`).

### 3. Backend (`routes/operators.js`)
- `GET /api/operators`: Trae los operadores del equipo del TL autenticado, incluyendo mediante un `LEFT JOIN` la lista de dispositivos que lo tienen seleccionado como `assigned_operator_id`.
- `POST /api/operators`: Crea un nuevo operador asociado al `team_id`.
- `PUT /api/operators/:id`: Modifica datos del operador.
- `DELETE /api/operators/:id`: Elimina/Desactiva al operador (sin afectar los dispositivos).

### 4. Frontend (`Sidebar.jsx` & `OperatorsView.jsx`)
- **Navegación:** Agregar la opción **"Operadores"** en la barra lateral izquierda (`Sidebar.jsx`).
- **Ficha Destacada Superior (Card Seleccionada):**
  - Foto de perfil estándar (Avatar placeholder estético).
  - Nombre del Operador seleccionado.
  - Lista/Badges de dispositivos que tiene actualmente asignados (si no tiene ninguno, mostrar *"Sin dispositivos vinculados"*).
- **Listado / Tabla Inferior:**
  - **Columnas:**
    1. Operador (Nombre y Apellido)
    2. Turno (Mañana / Tarde / Noche)
    3. Campaña/s
    4. Dispositivos asignados (Badges redondeados visuales, NO dropdowns)
    5. Acciones (Editar / Eliminar)
- **Modal `+ Nuevo Operador` / `Editar Operador`**:
  - Formulario liviano con: Nombre y Apellido, Turno y Campaña.

### 5. Impacto / Integraciones
- Al cargar operadores en este módulo, se pueblan automáticamente los desplegables de **"Operador Asignado"** en la vista y modal de **Dispositivos** (Módulos 2, 3 y 3.5).