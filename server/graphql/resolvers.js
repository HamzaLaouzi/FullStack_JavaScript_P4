const { GraphQLError } = require('graphql');// manejo errores graphql
const bcrypt = require('bcryptjs');

// importacion modelos
const User = require('../models/User');
const Voluntariado = require('../models/Voluntariado');

const { generateToken } = require('../auth');

const resolvers = {
  // querys ----------------------------------------------------------------------------------------------------------------------------------------------
  // obtener los usuarios ----------------------------------------------------------------
  usuarios: async (parent, args, context) => {
    try {
      return await User.find({}); 
    } catch (error) {
      throw new GraphQLError(`Error al obtener los usuarios: ${error.message}`);
    }
  },

  // buscar usuarios por id --------------------------------------------------------------
  usuario: async (args) => {    
    const { id } = args;
    
    if (!id) {
      throw new GraphQLError('El parametro ID es necesario');
    }
    
    try {
      const usuario = await User.findById(id); 
      
      return usuario;
    } catch (error) {
      throw new GraphQLError(`Error al buscar el usuario: ${error.message}`);
    }
  },

  // buscar usuario por email ------------------------------------------------------------
  usuarioPorEmail: async (args) => {
    const { email } = args;

    if (!email) {
      throw new GraphQLError('el parametro email es necesario');
    }

    try {
      const usuario = await User.findOne({ email });
      
      return usuario; 
    } catch (error) {
      throw new GraphQLError(`Error al buscar el usuario por email: ${error.message}`);
    }
  },

  // obtener los voluntariados -----------------------------------------------------------
  voluntariados: async () => {
    try {
      return await Voluntariado.find({}); 
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
      const voluntariado = await Voluntariado.findById(id); 
      
      return voluntariado;
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
      // Usamos Mongoose: find({ campo })
      const voluntariados = await Voluntariado.find({ volunType: tipo });
      return voluntariados;
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
      const voluntariados = await Voluntariado.find({ email: email });
      return voluntariados;
    } catch (error) {
      throw new GraphQLError(`Error al buscar por autor: ${error.message}`);
    }
  },

  // mutations -------------------------------------------------------------------------------------------------------------------------------------------

  // inicio de sesión autenticado -------------------------------------------------------
  login: async ({ email, password }) => {
    const user = await User.findOne({ email });
    if (!user) throw new GraphQLError('Usuario no encontrado');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new GraphQLError('Contraseña incorrecta');

    const token = generateToken(user);

    return { //authpayload
      token,
      userId: user.id,
      role: user.role
    };
  },

  // crear usuario ----------------------------------------------------------------------
  crearUsuario: async ({ input }) => {
    const { name, email, password, role } = input;

    const existeUsuario = await User.findOne({ email });
    if (existeUsuario) {
      throw new GraphQLError('Este correo ya tiene una cuenta.');
    }

    try {
        const newUser = new User({
        name,
        email,
        password, 
        role: role || 'user' // Si no llega rol, asignamos 'user'
    });
        
    return await newUser.save();
    } catch (error) {
        if (error.code === 11000) {
            throw new GraphQLError('', {
                extensions: { code: 'BAD_USER_INPUT' },
            });
        }
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message).join(', ');
            throw new GraphQLError(`Error de validación: ${messages}`, { extensions: { code: 'BAD_USER_INPUT' } });
        }
        throw new GraphQLError(`Error al crear el usuario: ${error.message}`);
    }
  },

  // actualizar usuario -----------------------------------------------------------------
  actualizarUsuario: async (args) => {
    const { id, input } = args;
    try {
      if (!id || !input) {
        throw new GraphQLError('Se requiere el ID y los nuevos datos');
      }

      let updateData = { ...input };

      if (updateData.password) { 
          const bcrypt = require("bcryptjs");
          updateData.password = await bcrypt.hash(updateData.password, 10);
      }
      
      delete updateData.email;
      
      const usuarioActualizado = await User.findByIdAndUpdate(
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
  crearVoluntariado: async (args) => {
    const { input } = args;

    if (!input) throw new GraphQLError('nuevo input requerido');

    try {
      const usuarioExiste = await User.findOne({ email: input.email });
      if (!usuarioExiste) {
        throw new GraphQLError('el usuario que intenta crear el voluntariado no existe');
      }

      const nuevoVoluntariado = await Voluntariado.create(input);
      
      return nuevoVoluntariado;
    } catch (error) {
      throw new GraphQLError(`Error al crear el voluntariado: ${error.message}`);
    }
  },

  // actualizar voluntariado -----------------------------------------------------------
  actualizarVoluntariado: async (args) => {
    const { id, input } = args;

    if (!id || !input) {
        throw new GraphQLError('el ID y los nuevos datos son obligatorios');
    }

    try {
      const volunActualizado = await Voluntariado.findByIdAndUpdate(
        id,
        { $set: input },
        { new: true, runValidators: true }
      );

      if (!volunActualizado) {
        throw new GraphQLError(`Voluntariado con id ${id} no encontrado`);
      }

      return volunActualizado;
    } catch (error) {
      throw new GraphQLError(`Error al actualizar el voluntariado: ${error.message}`);
    }
  },

  // eliminar voluntariado ------------------------------------------------------------
  eliminarVoluntariado: async (args) => {
    const { id } = args;
    try {
      if (!id) {
        throw new GraphQLError('Se requiere el ID como parametro');
      }
      const voluntariadoAEliminar = await Voluntariado.findByIdAndDelete(id);

      if (!voluntariadoAEliminar) {
        throw new GraphQLError(`Voluntariado con id ${id} no encontrado`);
      }

      return voluntariadoAEliminar;
    } catch (error) {
      throw new GraphQLError(`Error al eliminar el voluntariado: ${error.message}`);
    }
  },
};

module.exports = resolvers;