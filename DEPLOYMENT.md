# 🚀 Guía de Mantenimiento y Despliegue - SIMfinity

Este documento contiene las instrucciones esenciales para el mantenimiento, actualización y administración del servidor de producción de **SIMfinity**.

---

## 📌 Configuración del Entorno de Producción

* **IP del Servidor (Intranet):** `http://192.168.1.101:3001`
* **Acceso Local:** `http://localhost:3001`
* **Puerto Abierto en Firewall:** `3001` (TCP)
* **Gestor de Procesos:** PM2 (`SIMfinity`)
* **Ubicación Base de Datos:** `simcards-backend/data/simcards.db`

---

## 🔄 Flujo de Trabajo al Realizar Cambios en el Código

### 1. Si modificas el Frontend (`simcards-frontend`)
Cuando hagas cambios en la interfaz (React, CSS, componentes):
1. Navega a la carpeta del frontend y recompila:
   ```cmd
   cd "C:\Users\fgomez.TT\Desktop\PROYECTOS WS\SIMCARDS\simcards-frontend"
   npm run build
   ```
2. Reinicia el servicio en PM2 para que sirva los nuevos archivos estáticos:
   ```cmd
   npx pm2 restart SIMfinity
   ```

### 2. Si modificas solo el Backend (`simcards-backend`)
Cuando agregues/edites rutas en la API, controladores o modelos en Node.js:
1. Simplemente reinicia el proceso en PM2:
   ```cmd
   npx pm2 restart SIMfinity
   ```

---

## 🛠️ Comandos Frecuentes de PM2

Ejecutar desde cualquier terminal en la PC servidor:

| Acción | Comando |
| :--- | :--- |
| **Ver estado del servidor** | `npx pm2 status` |
| **Ver logs en tiempo real** | `npx pm2 logs SIMfinity` |
| **Reiniciar la aplicación** | `npx pm2 restart SIMfinity` |
| **Detener la aplicación** | `npx pm2 stop SIMfinity` |
| **Guardar estado actual** | `npx pm2 save` |

---

## 💾 Respaldos de la Base de Datos

Para realizar una copia de seguridad manual de los datos, copia el archivo SQLite:
* **Origen:** `simcards-backend/data/simcards.db`
* **Destino recomendado:** Disco externo, servidor de respaldos o carpeta en la nube.

---

## ⚠️ Solución de Problemas Rápidos

* **Si la red no accede:** Comprueba que la red de Windows esté en perfil **Privado** y que el puerto **3001** esté habilitado en el Firewall.
* **Si la PC servidor se reinicia:** PM2 está configurado para levantar `SIMfinity` automáticamente en el arranque de Windows. Verifica el estado con `npx pm2 status`.



### Estrategia de Compilación y Despliegue (Frontend)

El archivo `vite.config.js` está configurado con una ruta de salida dinámica para garantizar la compatibilidad multi-entorno y evitar bloqueos por cifrado EFS.

* **Entorno de Trabajo (Intranet Corporativa):**
  * **Comando:** `npm run build`
  * **Salida:** `C:/ServiciosLocal/simcards-app/dist`
  * **Detalle:** Mantiene el código fuente resguardado en la carpeta de desarrollo cifrada, mientras genera la versión pública del frontend en una ruta no cifrada para que el servidor web la entregue a la red sin errores de permisos (`EPERM`).

* **Entorno Externo (Casa, Desarrollo Personal o Servidor en la Nube):**
  * **Comando:** `npx vite build --outDir ./dist` *(o definiendo la variable `BUILD_OUT_DIR=./dist`)*
  * **Salida:** `./dist` (carpeta local dentro del proyecto)
  * **Detalle:** Permite clonar y compilar el proyecto en cualquier sistema operativo (Windows, Linux, macOS) de forma portátil sin necesidad de modificar el código ni la configuración base.