// Herramientas
const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const { createServer } = require('http'); // Necesario para Socket.io
const { Server } = require('socket.io'); // Importamos Socket.io

// Base de datos y GraphQL
const { connectDB } = require('./mongo');
const { typeDefs } = require('./graphql/schema');
const { resolvers } = require('./graphql/resolvers');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { authMiddleware } = require('./auth'); // Tu middleware de auth (verificar ruta)

// Rutas REST (opcional si ya usas todo GraphQL)
const userRoutes = require('./rutas/userRoutes'); 
const cardRoutes = require('./rutas/cardRoutes');

// 1. Configuración Inicial
const app = express();
const httpServer = createServer(app); // Creamos servidor HTTP envolviendo Express

// 2. Conectar a MongoDB
connectDB();

// 3. Configurar Socket.io (CORS es vital aquí)
const io = new Server(httpServer, {
    cors: {
        origin: "*", // Permite conexiones desde cualquier frontend
        methods: ["GET", "POST"]
    }
});

// Eventos de Socket.io
io.on('connection', (socket) => {
    console.log('✨ Cliente conectado a WebSockets:', socket.id);
    
    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
});

// Hacemos 'io' accesible en toda la app (para usarlo en resolvers/controladores)
app.set('socketio', io);

// 4. Middlewares de Express
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Servir el Frontend (HTML/CSS/JS)

// 5. Configurar Apollo Server
const startServer = async () => {
    const server = new ApolloServer({ typeDefs, resolvers });
    await server.start();

    // Middleware de GraphQL con Contexto (Pasamos el usuario y socket.io)
    app.use('/graphql', expressMiddleware(server, {
        context: async ({ req }) => {
            const user = authMiddleware(req); // Verificamos token
            return { user, io }; // Inyectamos usuario y socket.io al contexto
        }
    }));

    // Rutas REST legacy (si las necesitas)
    app.use('/api/users', userRoutes);
    app.use('/api/cards', cardRoutes);

    // 6. ARRANCAR EL SERVIDOR (Usamos httpServer, NO app)
    const PORT = process.env.PORT || 4000;
    httpServer.listen(PORT, () => {
        console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
        console.log(`📡 WebSockets listos`);
        console.log(`graphQL en http://localhost:${PORT}/graphql`);
    });
};

startServer();