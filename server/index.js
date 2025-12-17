const express = require('express');
const http = require('http'); // Importar HTTP
const { Server } = require("socket.io"); // Importar Socket.io
const mongoose = require('./mongo'); // Tu conexión a BD
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const server = http.createServer(app); // Crear servidor HTTP envolviendo a Express
const io = new Server(server, {
  cors: {
    origin: "*", // Ajusta esto en producción a tu dominio de frontend
    methods: ["GET", "POST"]
  }
});

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas API
app.use('/api/users', require('./rutas/userRoutes'));
app.use('/api/cards', require('./rutas/cardRoutes'));

// WebSockets
io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);

  // Ejemplo: Escuchar evento del cliente
  socket.on('nuevo_voluntariado', (data) => {
    // Reenviar a todos los clientes para actualizar el dashboard en tiempo real
    io.emit('actualizar_dashboard', data);
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});

// Hacer disponible 'io' en la app si lo necesitas en controladores
app.set('socketio', io);

// Servir estáticos en producción/despliegue
app.use(express.static(path.join(__dirname, '../public')));

const PORT = process.env.PORT || 5000;
// IMPORTANTE: Usar server.listen, no app.listen
server.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});