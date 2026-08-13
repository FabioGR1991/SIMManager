import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Plugin para registrar las IPs que se conectan
const networkLogger = () => ({
  name: 'network-logger',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      // Ignorar archivos internos para no saturar la consola
      if (
        !req.url.includes('/@vite/') && 
        !req.url.includes('/node_modules/') && 
        !req.url.includes('.jsx') && 
        !req.url.includes('.css')
      ) {
        const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'IP desconocida';
        const clientIp = rawIp.replace(/^.*:/, '') || '127.0.0.1'; 
        const time = new Date().toLocaleTimeString();
        
        console.log(`\x1b[36m[${time}]\x1b[0m \x1b[33m🌐 Conexión desde:\x1b[0m \x1b[1m${clientIp}\x1b[0m ➜ \x1b[32m${req.method}\x1b[0m ${req.url}`);
      }
      next();
    });
  }
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), networkLogger()],
  server: {
    host: '0.0.0.0', // Escucha en todas las interfaces de red
    port: 3000,      // Mantiene el puerto 3000 por defecto
  },
});