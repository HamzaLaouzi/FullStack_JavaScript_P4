const { GraphQLError } = require('graphql');// manejo errores graphql

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
  usuarios: async (parent, args, context) => {
    // 1. Verificar si hay usuario autenticado
    if (!context.user) {
        throw new GraphQLError('No estás autenticado', { extensions: { code: 'UNAUTHENTICATED' } });
    }

    // 2. Verificar Rol (Requisito Rúbrica: Admin ve todo, Usuario solo lo suyo)
    if (context.user.role !== 'admin') {
        throw new GraphQLError('Acceso denegado: Se requieren permisos de Administrador', { extensions: { code: 'FORBIDDEN' } });
    }

    try {
        return await User.find({});
    } catch (error) {
        throw new GraphQLError(`Error: ${error.message}`);
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
  login: async (args) => {
    const { email, password } = args;

    try {
      const usuario = await User.findOne({ email }).select('+password');

      if (!usuario) {
        throw new GraphQLError('El correo no es correcto', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const isPasswordValid = await usuario.comparePassword(password);

      if (!isPasswordValid) {
        throw new GraphQLError('La contraseña no es correcta', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

    const token = generateToken(usuario);      return token;
    } catch (error) {
      if (error.extensions?.code === 'UNAUTHENTICATED') {
          throw error;
      }
      throw new GraphQLError(`Error, no se ha podido hacer login: ${error.message}`);
    }
  },

  // crear usuario ----------------------------------------------------------------------
  crearUsuario: async (args) => {
    const { input } = args;

    if (!input || !input.name || !input.email || !input.password) {
        throw new GraphQLError('los campos son obligatorios');
    }

    try {
        const nuevoUsuario = await User.create({
            name: input.name,
            email: input.email,
            password: input.password,
        });
        
        return nuevoUsuario;
    } catch (error) {
        if (error.code === 11000) {
            throw new GraphQLError('Este correo ya tiene una cuenta', {
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