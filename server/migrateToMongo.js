// herramientas ---------------------------------------------------------------
const dotenv = require('dotenv');
dotenv.config();
const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");

// importar datos iniciales ----------------------------------------------------
const { usuarios: initialUsers, voluntariados: initialVoluntariados } = require('./datos/datos');

const uri = process.env.MONGODB_URI;
const dbName = "voluntariadosDB";

if (!uri) {
    console.error('Error: MONGODB_URI no está definida en .env');
    process.exit(1);
}

// migración a mongo, limpiar colecciones y hash contraseñas --------------------
async function migrate() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    console.log(`Conectado a mongodb: ${dbName}`);

    const usersCol = db.collection("usuarios");
    const voluntariadosCol = db.collection("voluntariados");

    await usersCol.deleteMany({});
    await voluntariadosCol.deleteMany({});
    console.log("colecciones limpias");

    const usersWithHashed = await Promise.all(initialUsers.map(async user => {
      if (user.password) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        return { ...user, password: hashedPassword, createdAt: new Date().toISOString() };
      }
      return { ...user, createdAt: new Date().toISOString() };
    }));
    
    const resultUsers = await usersCol.insertMany(usersWithHashed);
    console.log(`🟢 ${resultUsers.insertedCount} usuarios insertados en la bbdd`);

    const voluntariadosToInsert = initialVoluntariados.map(v => ({
        ...v,
        createdAt: new Date().toISOString()
    }));
    const resultVoluntariados = await voluntariadosCol.insertMany(voluntariadosToInsert);
    console.log(`🟢 ${resultVoluntariados.insertedCount} voluntariados insertados en la bbdd`);

    console.log("migracion completa");

  } catch (error) {
    console.error("No se ha podido completar la migración:", error);
    process.exit(1);
  } finally {
    await client.close();
    console.log("conexion cerrada con la bbdd");
  }
}

migrate();