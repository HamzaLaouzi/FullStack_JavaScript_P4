/*

implementa las operciones del esquema, interactua con los modelos de mongodb, funcionalidades de autenticación jwt y recibe el contexto de autenticación y el servidor
*/

const { GraphQLError } = require('graphql');// manejo errores graphql
const bcrypt = require('bcryptjs');

// importacion modelos
const User = require('../models/User');
const Voluntariado = require('../models/Voluntariado');

const { generateToken } = require('../auth'); // crear token

// Autorizaciones según log y roles ----------------------------------------------------
const checkAuth = (context, requireAdmin = false) => {
    if (!context || !context.user) {
        throw new GraphQLError('No has iniciado sesión.', {
            extensions: { code: 'UNAUTHENTICATED' }
        });
    }
    
    if (requireAdmin && context.user.role !== 'admin') { // verificar rol admin si se requiere
        throw new GraphQLError('Se requiere tener rol admin para hacer esta acción', {
            extensions: { code: 'FORBIDDEN' }
        });
    }
    
    return context.user; // si todo ok, devuelve el user
};

// helper id comunicacion graphql-mongo --------------------------------------------------
const toGraph = (doc) => { // convierte mongo a graphql
    if (!doc) return null;
    const { _id, ...rest } = doc; // separa el id
    return { id: _id, ...rest }; // devuelve el id
};

// eventos de aviso al cambiar voluntariados --------------------------------------------
const notificacionVoluntariados = (context, accion, datos) => {
    // DEBUGGIN BABY --------------------
    if (!context) {
        console.error("context es undefined o null.");
        return;
    }
    if (!context.io) {
        console.error("context.io no existe.");
        return;
    }
    console.log(`Evento socket: ${accion} emitido a 'voluntariados_room'`);

  if (context.io) { // enviar evento a la sala
        context.io.to('voluntariados_room').emit('voluntariados_update', { // sala especíica y nombre del evento
            action: accion, // crud
            data: datos // campos
        });
    }
};

// Implementación querys y mutations ------------------------------------------------------
const resolvers = {
  // querys ----------------------------------------------------------------------------------------------------------------------------------------------
  // obtener los usuarios ----------------------------------------------------------------
  usuarios: async (_, context) => {
    const currentUser = checkAuth(context);
    try {
      if (currentUser.role === 'admin') { // si es admin devuelve todos
          const users = await User.find({}).lean();
          return users.map(toGraph); // convertir el id
      } else {
          const myUser = await User.findById(currentUser.userId).lean(); // si es user devuelve solo el propio
          return myUser ? [toGraph(myUser)] : [];
      }
    } catch (error) {
      throw new GraphQLError(`Error al obtener los usuarios: ${error.message}`);
    }
  },

  // buscar usuarios por id --------------------------------------------------------------
  usuario: async (args) => {    
    checkAuth(context); // check autenticación
    const { id } = args;
    
    if (!id) {
      throw new GraphQLError('El parametro ID es necesario');
    }
    
    try {
      const usuario = await User.findById(id).lean();
      return toGraph(usuario);
    } catch (error) {
      throw new GraphQLError(`Error al buscar el usuario: ${error.message}`);
    }
  },

  // buscar usuario por email ------------------------------------------------------------
  usuarioPorEmail: async (args) => {
    checkAuth(context); // check autenticación
    const { email } = args;

    if (!email) {
      throw new GraphQLError('el parametro email es necesario');
    }

    try {
      const usuario = await User.findOne({ email }).lean();
      return toGraph(usuario); 
    } catch (error) {
      throw new GraphQLError(`Error al buscar el usuario por email: ${error.message}`);
    }
  },

  // obtener los voluntariados -----------------------------------------------------------
  voluntariados: async () => {
    try {
      const docs = await Voluntariado.find({}).lean();
      return docs.map(toGraph);
    } catch (error) {
      throw new GraphQLError(`Error al obtener los voluntariados: ${error.message}`);
    }
  },

  // buscar voluntariado por id ----------------------------------------------------------
  voluntariado: async (args) => {
    const { id } = args;
    
    if (!id) {
      throw new GraphQLError('El parametro ID es necesario');
    }
    
    try {
      const doc = await Voluntariado.findById(id).lean();
      return toGraph(doc);
    } catch (error) {
      throw new GraphQLError(`Error al buscar el voluntariado: ${error.message}`);
    }
  },

  // buscar voluntariados por tipo -------------------------------------------------------
  voluntariadosPorTipo: async (args) => {
    const { tipo } = args;

    if (!tipo) {
      throw new GraphQLError('el parametro tipo es necesario');
    }

    try {
      const docs = await Voluntariado.find({ volunType: tipo }).lean();
      return docs.map(toGraph);
    } catch (error) {
      throw new GraphQLError(`Error al buscar por tipo: ${error.message}`);
    }
  },

  // buscar voluntariados por autor ------------------------------------------------------
  voluntariadosPorAutor: async (args) => {
    const { email } = args;

    if (!email) {
      throw new GraphQLError('el parametro email es necesario');
    }

    try {
      const docs = await Voluntariado.find({ email: email }).lean();
      return docs.map(toGraph);
    } catch (error) {
      throw new GraphQLError(`Error al buscar por autor: ${error.message}`);
    }
  },

  // datos gráfico ---------------------------------------------
  estadisticasVoluntariados: async () => { 
    try {
      return await Voluntariado.aggregate([ // agregacion para el gráfico por tipo
        { $group: { _id: "$volunType", cantidad: { $sum: 1 } } }, // agrupa por tipo y cuenta
       { $project: { tipo: "$_id", cantidad: 1, _id: 0 } } // pasar id a tipo
      ]);
    } catch (error) { throw new GraphQLError(error.message); }
  },

  // mutations -------------------------------------------------------------------------------------------------------------------------------------------
  // inicio de sesión autenticado -------------------------------------------------------
  login: async ({ email, password }) => {
    const user = await User.findOne({ email }); // buscar al user por email
    if (!user) throw new GraphQLError('Usuario no encontrado');

    const valid = await bcrypt.compare(password, user.password); // comparar contraseña (hash)
    if (!valid) throw new GraphQLError('Contraseña incorrecta');

    const token = generateToken(user); // generar el token

    return { //authpayload
      token,
      userId: user.id, // id de mongo
      role: user.role
    };
  },

  // crear usuario ----------------------------------------------------------------------
  crearUsuario: async ({ input }) => {
    const { name, email, password, role } = input;

    if (role === 'admin') checkAuth(context, true); // sólo el usuario admin puede crear usuarios admin

    const existeUsuario = await User.findOne({ email }); // verificar si existe el correo
    if (existeUsuario) {
      throw new GraphQLError('Este correo ya tiene una cuenta.');
    }

    try { // crear el nuevo user
        const newUser = new User({
        name,
        email,
        password, 
        role: role || 'user' // Si no llega rol, asignamos 'user'
    });
        
    return await newUser.save(); // guardar en mongo
    } catch (error) {
        if (error.code === 11000) {
            throw new GraphQLError('', {
                extensions: { code: 'BAD_USER_INPUT' },
            });
        }
        if (error.name === 'ValidationError') { // errores de esquema
            const messages = Object.values(error.errors).map(val => val.message).join(', ');
            throw new GraphQLError(`Error de validación: ${messages}`, { extensions: { code: 'BAD_USER_INPUT' } });
        }
        throw new GraphQLError(`Error al crear el usuario: ${error.message}`);
    }
  },

  // actualizar usuario -----------------------------------------------------------------
  actualizarUsuario: async (args) => {
    const { id, input } = args;

    const currentUser = checkAuth(context);
    if (currentUser.role !== 'admin' && currentUser.userId !== id) { // editar user sólo si es admin o si es el propio log
      throw new GraphQLError('No tienes permiso para modificar este usuario.');
    }

    try {
      if (!id || !input) {
        throw new GraphQLError('Se requiere el ID y los nuevos datos');
      }

      let updateData = { ...input };

      if (updateData.password) { //hash a la nueva contraseña si se cambia
          const bcrypt = require("bcryptjs");
          updateData.password = await bcrypt.hash(updateData.password, 10);
      }
      
      delete updateData.email; // no se puede editar el mail
      
      const usuarioActualizado = await User.findByIdAndUpdate( // actualizar en la bbdd
        id,
        { $set: updateData },
        { new: true, runValidators: true } 
      );

      if (!usuarioActualizado) {
        throw new GraphQLError(`Usuario con id ${id} no encontrado`);
      }

      return usuarioActualizado;
    } catch (error) {
      throw new GraphQLError(`Error al actualizar el usuario: ${error.message}`);
    }
  },

  // eliminar usuario -------------------------------------------------------------------
  eliminarUsuario: async (args) => {
    const { id } = args;

    checkAuth(context, true); // check admin

    try {
      if (!id) {
        throw new GraphQLError('Se requiere el ID como parametro');
      }
      const usuarioAEliminar = await User.findByIdAndDelete(id);

      if (!usuarioAEliminar) {
        throw new GraphQLError(`Usuario con id ${id} no encontrado`);
      }
      
      return usuarioAEliminar;
    } catch (error) {
      throw new GraphQLError(`Error al eliminar el usuario: ${error.message}`);
    }
  },

  //crear voluntariado ----------------------------------------------------------------
  crearVoluntariado: async ({ input }, context) => {
    const currentUser = checkAuth(context); // check autenticación
    if (input.email !== currentUser.email && currentUser.role !== 'admin') { // el autor es el user log
        throw new GraphQLError('No se pueden crear voluntariados para otros usuarios');
    }
    
    if (!input) throw new GraphQLError('nuevo input requerido');

    try {
      const usuarioExiste = await User.findOne({ email: input.email }); // check que el user exista
      if (!usuarioExiste) {
        throw new GraphQLError('el usuario que intenta crear el voluntariado no existe');
      }

      const nuevoVoluntariado = await Voluntariado.create(input); // crear en la bbdd

      notificacionVoluntariados(context, 'create', { title: nuevoVoluntariado.title }); // hook para notificar a los clientes
      
      return nuevoVoluntariado;
    } catch (error) {
      throw new GraphQLError(`Error al crear el voluntariado: ${error.message}`);
    }
  },

  // actualizar voluntariado -----------------------------------------------------------
  actualizarVoluntariado: async ({ id, input }, context) => {
    const currentUser = checkAuth(context);
    
    const voluntariado = await Voluntariado.findById(id);
    if (!voluntariado) throw new GraphQLError(`Voluntariado con id ${id} no encontrado`);

    if (!id || !input) {
        throw new GraphQLError('el ID y los nuevos datos son obligatorios');
    }

    const esAdmin = currentUser.role === 'admin'; // solo se puede modificar si es admin o es autor
    const esAutor = voluntariado.email === currentUser.email;
    if (!esAdmin && !esAutor) {
        throw new GraphQLError('No tienes permiso para editar este voluntariado.');
    }

    try {
      const volunActualizado = await Voluntariado.findByIdAndUpdate(
        id,
        { $set: input },
        { new: true, runValidators: true }
      );

      notificacionVoluntariados(context, 'update', { id }); // hook para notificar a los clientes

      return volunActualizado;
    } catch (error) {
      throw new GraphQLError(`Error al actualizar el voluntariado: ${error.message}`);
    }
  },

  // eliminar voluntariado ------------------------------------------------------------
  eliminarVoluntariado: async ({ id }, context) => {
    const currentUser = checkAuth(context);
     if (!id) {
        throw new GraphQLError('Se requiere el ID como parametro');
      }

    const voluntariado = await Voluntariado.findById(id);
    if (!voluntariado) throw new GraphQLError(`Voluntariado con id ${id} no encontrado`);

    const esAdmin = currentUser.role === 'admin';  // solo se puede modificar si es admin o es autor
    const esAutor = voluntariado.email === currentUser.email;
    if (!esAdmin && !esAutor) {
        throw new GraphQLError('No tienes permiso para editar este voluntariado.');
    }

    try {
      const voluntariadoAEliminar = await Voluntariado.findByIdAndDelete(id);

      notificacionVoluntariados(context, 'delete', { id }); // hook para notificar a los clientes

      return voluntariadoAEliminar;
    } catch (error) {
      throw new GraphQLError(`Error al eliminar el voluntariado: ${error.message}`);
    }
  },
};

module.exports = resolvers;