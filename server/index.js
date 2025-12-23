/*
inicio de la aplicación, configuración del servidor (https y conexión realtime WS, conecta con la BBDD y graphql)
*/

// Herramientas -----------------------------------------------------------------------------------------------------
const dotenv = require('dotenv'); // variables de entorno
dotenv.config(); // cargar configuración
const express = require('express'); // crear el servidor web
const {graphqlHTTP} = require('express-graphql'); // manejar graphql
const {ruruHTML} = require('ruru/server'); // para probar graphql
const cors = require('cors'); // permitir peticiones desde postman
const mongoose = require('mongoose'); // mongoose en lugar del driver nativo
const https = require('https'); // servidor nativo
const fs = require('fs');
const { Server } = require("socket.io"); // servidor de sockets
// modulos -----------------------------------------------------------------------------------------------------------
const { connectDB } = require('./mongo'); // conectar con mongodb
const { verifyToken } = require("./auth"); // autenticacion
const schema = require('./graphql/schema'); // define qué preguntar
const resolvers = require('./graphql/resolvers'); // define cómo responder
const userRoutes = require('./rutas/userRoutes'); // rutas rest users
const cardRoutes = require('./rutas/cardRoutes'); // rutas rest voluntariados
const Usuario = require('./models/User'); // modelos mongoose
const Voluntariado = require('./models/Voluntariado');

// Crear la aplicación con express -----------------------------------------------------------------------------------
const app = express();
const PORT = process.env.PORT || 4000; // puerto para correr el servidor

// Configuración servidor https y sockets ----------------------------------------------------------------------------
let httpsServer;
try {
    const httpsOptions = { // lee los certificados ssl
        key: fs.readFileSync('server.key'),
        cert: fs.readFileSync('server.cert'),
    };
    httpsServer = https.createServer(httpsOptions, app); // crea el servidor
} catch (e) {
    console.error("Error al cargar certificados", e);
    process.exit(1);
}

// inicializar IO ---------------------------------------------------------------------------------------------------
const io = new Server(httpsServer, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"]
    }
});

// Configurar procesadores -------------------------------------------------------------------------------------------
app.use(cors()); // permitir peticiones desde postman
app.use(express.json()); // para que express entienda json
app.use(express.static('public')); // para los html

// Autenticacion para websocket --------------------------------------------------------------------------------------
io.use((socket, next) => {
    const token = socket.handshake.auth.token; // obtener token
    if (token) {
        const user = verifyToken(token); // validar token
        if (user) {
            socket.user = user; // introducir datos usuario
            return next();
        }
    }
    console.log("Conexión de socket sin token válido");
    next(new Error("unauthorized")); // si no hay token o es inválido, rechazar
});

// gestion de salas --------------------------------------------------------------------------------------------------
io.on('connection', (socket) => {
    console.log('Cliente conectado con websocket:', socket.id);

    socket.on('join_voluntariados', () => {
        socket.join('voluntariados_room'); // sala específica
        console.log(`Socket unido a sala voluntariados con id ${socket.id}`);
    });
    socket.on('disconnect', () => {
        console.log('Desconectado');
    });
});

// rutas rest --------------------------------------------------------------------------------------------------------
app.use('/api/users', userRoutes);
app.use('/api/cards', cardRoutes);

// Configurar graphql ------------------------------------------------------------------------------------------------
app.get('/', (_req, res) => {
  res.type('html');
  res.end(ruruHTML({endpoint: "/graphql"}));
});

// ruta para las consultas de graphql -------------------------------------
app.use('/graphql', graphqlHTTP(async (req) => {
    let user = null;
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) { // autenticacion
        token = req.headers.authorization.split(' ')[1];
        if (token) {
            user = verifyToken(token);
        }
    }
    
    return {
        schema: schema,
        rootValue: resolvers,
        context: { user: user, io: io }, // io para resolvers
        graphiql: true, 
    };
}));

// ruta inicio -------------------------------------------------------------------------------------------------------
app.get('/api', async (_req, res) => {
  try {
    const totalUsuarios = await Usuario.countDocuments();
    const totalVoluntariados = await Voluntariado.countDocuments();
  
  res.json({
    mensaje: 'Servidor graphql en funcionamiento',
    endpoints: {
      graphql: '/graphql',
      interfaz: '/',
      estado: '/api/estado'
    },
    datos_en_mongodb: {
      usuarios: totalUsuarios,
      voluntariados: totalVoluntariados
    }
  });
 } catch (error) {
  res.status(500).json({
    error: 'Error al obtener los datos de mongodb',
    mensaje: error.message
  });
 } 
});

// reuta comprobación datos ----------------------------------------------------------------------------------------
app.get('/api/estado', async (_req, res) => {
  try {
    const estado = mongoose.connection.readyState === 1? 'Conectado' : 'Desconectado';
  
    const usuarios = await Usuario.find().select('name email').limit(3).lean();
    const voluntariados = await Voluntariado.find().select('title autor').limit(3).lean();
  
  res.json({
    message: 'servidor y bbdd en funcionamiento',
    estado_ddbb: estado,
    conexion_mongodb: estado === 'Conectado' ? 'activa' : 'inactiva',
    timestamp: new Date().toISOString(),
    api_rest_rutas: ['/api/users', '/api/cards'],
    graphql_endpoint: '/graphql',
    datos_en_mongodb: {
                usuarios: usuarios.map(u => ({ 
                    id: u._id.toString(), 
                    name: u.name, 
                    email: u.email 
                })),
                voluntariados: voluntariados.map(a => ({ 
                    id: a._id.toString(), 
                    title: a.title, 
                    autor: a.autor 
                }))
    }
  });
 } catch (error) {
  res.status(500).json({
    error: 'Error al obtener los datos de mongodb',
    mensaje: error.message
  });
 }
});

// errores --------------------------------------------------------------------------------------------------------
// ruta --------------------------------------------------------
app.use((req, res) => {
  res.status(404).json({
    error: 'la ruta no se encuentra',
    mensaje: `la ruta ${req.url} no existe`,
    rutas_validas: ['/graphql', '/', '/api', '/api/estado', '/api/users', '/api/cards']
  });
});

// servidor -----------------------------------------------------
app.use((error, req, res, next) => {
  console.error('error del servidor:', error.message);
  res.status(500).json({
    error: 'error interno del servidor',
    mensaje: error.message,
  });
});

// iniciar el servidor --------------------------------------------------------------------------------------------------
async function startServer() {
    try {
      await connectDB();

      httpsServer.listen(PORT, () => {
        console.log(`Servidor https y sockets coorriendo en el localhost ${PORT}`);
        console.log(`Modo (dev/prod): ${process.env.NODE_ENV || 'desarrollo'}`);
      });
    } catch (error) {
        console.error('Fallo al inciar el servidor:', error.message);
        process.exit(1); 
    }
}

startServer();




