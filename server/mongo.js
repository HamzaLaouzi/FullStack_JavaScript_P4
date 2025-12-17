const mongoose = require('mongoose');
const uri = process.env.MONGODB_URI; // la uri se lee en index.js

let isConnected = false; // control de conexión

// conectar con mongodb con mongoose -----------------------------------
async function connectDB() {
    if (isConnected) {
        console.log('Conectado a la BBDD');
        return;
    }

    if (!uri) {
        console.error('Error con la uri: no está definida');
        process.exit(1);
    }

    try {
        await mongoose.connect(uri);
        isConnected = true;
        console.log('Conectado a mongodb con mongoose');
        return mongoose.connection; 

    } catch (error) {
        console.error('Error en la conexión con mongodb', error.message);
        throw error;
    }
}

module.exports = { connectDB };