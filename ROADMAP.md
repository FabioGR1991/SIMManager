aaaah me parecia, bueno, entonces pasame mi ROADMAP.md actualizado para pegar en mi archivo tachando lo que ya esta hecho:

# 🗺️ ROADMAP DE FUNCIONALIDADES - SIMCARDS APP

---

## ~~🟢 Módulo 1: WhatsApp en SIMCards (Editar SIM)~~
**Estado:** [ ] Pendiente | [ ] En Progreso | [x] Completado

### ~~1. Base de Datos (`simcards.db`)~~
- ~~Agregar columna `wa_type` (`TEXT`: `'Comun'`, `'Business'`, `NULL`) a la tabla `simcards`.~~
- ~~Agregar columna `wa_link` (`TEXT`: enlace `https://wa.me/...`, `NULL`) a la tabla `simcards`.~~

### ~~2. Backend (`routes/simcards.js`)~~
- ~~Modificar el endpoint `PUT /api/simcards/edit/:id` y `POST /api/simcards` para recibir y guardar `wa_type` y `wa_link`.~~
- ~~Ajustar el endpoint `GET /api/simcards` para incluir estas variables en la respuesta JSON.~~

### ~~3. Frontend (`App.jsx` / `SimEditModal.jsx`)~~
- ~~Actualizada la función de guardado/creación en `App.jsx` para despachar `wa_type` y `wa_link`.~~
- ~~Agregar el campo desplegable **Tipo de WhatsApp** (`-- Seleccionar --`, `Comun`, `Business`).~~
- ~~Agregar el campo de texto **Link de WhatsApp** (deshabilitado hasta elegir tipo).~~
- ~~Lógica de reseteo: si se vuelve a `-- Seleccionar --`, limpiar el campo de texto.~~

### ~~4. Impacto / Integraciones~~
- ~~**Vista de Tabla SIMs (`DashboardView.jsx` / `SyncView.jsx`)**: Mostrar ícono de WhatsApp en la celda con el enlace clickeable si la línea tiene WhatsApp configurado.~~

---

## ~~🔵 Módulo 2: Edición Ampliada de Dispositivos (Celulares)~~
**Estado:** [ ] Pendiente | [ ] En Progreso | [x] Completado

### ~~1. Base de Datos (`simcards.db`)~~
- ~~Modificar tabla `devices` para incluir:~~
  - ~~`internal_name` (`TEXT`): Nombre interno para comunicación del equipo.~~
  - ~~`entity` (`TEXT`): Entidad/Área asignada.~~
  - ~~`assigned_operator_id` (`INTEGER`): ID del operador asignado a SIM 1.~~
  - ~~`assigned_operator2_id` (`INTEGER`): ID del operador asignado a SIM 2.~~
  - ~~`sim1_is_official` y `sim2_is_official` (`INTEGER/BOOLEAN`): Indicador de casilla "Oficial".~~

### ~~2. Backend (`routes/devices.js`)~~
- ~~Modificar `GET /api/devices`:~~
  - ~~Hacer `LEFT JOIN` con la tabla `simcards` para traer los datos de las SIMs asignadas (incluyendo `wa_type` y `wa_link`).~~
  - ~~Hacer `LEFT JOIN` con la tabla `operators` para traer los nombres de los operadores asignados a SIM 1 y SIM 2.~~
- ~~Modificar `PUT /api/devices/:id` y `POST /api/devices`:~~
  - ~~Guardar `internal_name`, `entity`, `assigned_operator_id`, `assigned_operator2_id`, `status`, `sim1_id`, `sim2_id`, `sim1_is_official`, `sim2_is_official`.~~

### ~~3. Frontend (`DeviceEditModal.jsx`)~~
- ~~**Rediseño visual a 2 columnas:**~~
  - ~~**Columna Izquierda:**~~
    - ~~Modelo / Nombre (`input`)~~
    - ~~Entidad (`input`)~~
    - ~~SIM 1 (`Select`) + Checkbox "Oficial" + tarjeta de enlace WA dinámico con botón de copiar.~~
    - ~~SIM 2 (`Select`) + Checkbox "Oficial" + tarjeta de enlace WA dinámico con botón de copiar.~~
  - ~~**Columna Derecha:**~~
    - ~~Nombre interno (`input`)~~
    - ~~Estado del dispositivo (`dropdown`: ACTIVO, INACTIVO/REPUESTO, EN REPARACION, EN RESERVA)~~
    - ~~Operador Asignado (SIM 1) (`Select` de operadores)~~
    - ~~Operador Asignado (SIM 2) (`Select` de operadores)~~

### ~~4. Dependencias e Impacto~~
- ~~**Integración:** Conectado exitosamente con la lista de Operadores y SIMs para auto-completar desplegables y acciones de un clic.~~

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

---

## 🟣 Módulo 3.5: Ficha Destacada de Dispositivo y Modal "+ Info" (Solo Lectura)
**Estado:** [ ] Pendiente | [ ] En Progreso | [ ] Completado

### 1. Base de Datos (`simcards.db`)
- *(Utiliza los campos creados en los Módulos 1 y 2: `internal_name`, `entity`, `assigned_operator_id`, `assigned_operator2_id`, `wa_link`)*.

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

---

## ~~🟡 Módulo 4: Gestión de Operadores~~
**Estado:** [ ] Pendiente | [ ] En Progreso | [x] Completado

### ~~1. Regla de Arquitectura (Aislamiento Total)~~
- ~~Los operadores pertenecen **únicamente** a un equipo (`team_id` / `team`).~~
- ~~No poseen ni arrastran SIMs ni Dispositivos.~~
- ~~En la base de datos, la relación con `devices` es de tipo `SET NULL`: si un operador es eliminado o editado, **el dispositivo permanece intacto** y solo se vacía su campo de operador asignado.~~

### ~~2. Base de Datos (`simcards.db`)~~
- ~~Crear la tabla `operators`:~~
  - ~~`id` (`INTEGER PRIMARY KEY AUTOINCREMENT`)~~
  - ~~`full_name` (`TEXT`): Nombre y Apellido.~~
  - ~~`shift` (`TEXT`): Turno (Mañana / Tarde / Noche).~~
  - ~~`campaign` (`TEXT`): Campaña/s asignadas.~~
  - ~~`team` (`TEXT`): Nombre del equipo al que pertenece (aislado por TL).~~
  - ~~`status` (`TEXT`): Estado (`ACTIVO` / `INACTIVO`).~~

### ~~3. Backend (`routes/operators.js`)~~
- ~~`GET /api/operators`: Trae los operadores del equipo del TL autenticado, incluyendo mediante un `LEFT JOIN` la lista de dispositivos que lo tienen seleccionado como `assigned_operator_id`.~~
- ~~`POST /api/operators`: Crea un nuevo operador asociado al `team`.~~
- ~~`PUT /api/operators/:id`: Modifica datos del operador.~~
- ~~`DELETE /api/operators/:id`: Elimina/Desactiva al operador (sin afectar los dispositivos).~~

### ~~4. Frontend (`Sidebar.jsx` & `OperatorsView.jsx`)~~
- ~~**Navegación:** Agregar la opción **"Operadores"** en la barra lateral izquierda (`Sidebar.jsx`).~~
- ~~**Ficha Destacada Superior (Card Seleccionada):**~~
  - ~~Foto de perfil estándar (Avatar placeholder estético).~~
  - ~~Nombre del Operador seleccionado.~~
  - ~~Lista/Badges de dispositivos que tiene actualmente asignados.~~
- ~~**Listado / Tabla Inferior:**~~
  - ~~**Columnas:** Operador, Turno, Campaña/s, Dispositivos asignados, Acciones.~~
- ~~**Modal `+ Nuevo Operador` / `Editar Operador`**:~~
  - ~~Formulario liviano: Nombre y Apellido, Turno y Campaña.~~

### ~~5. Impacto / Integraciones~~
- ~~Al cargar operadores en este módulo, se pueblan automáticamente los desplegables de **"Operador Asignado (SIM 1)"** y **"Operador Asignado (SIM 2)"** en la vista y modal de **Dispositivos**.~~ 