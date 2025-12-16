const User = require('../models/User');
const bcrypt = require("bcryptjs");

// obtener ususarios ------------------------------------------------
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}); 
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los usuarios', error: error.message });
  }
};

// buscar usuario por id ---------------------------------------------
exports.getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id); 
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    res.json(user);
  } catch (error) {
    if (error.kind === 'ObjectId') {
        return res.status(400).json({ message: 'El id del usuario es inválido' });
    }
    res.status(500).json({ message: 'Error al buscar usuario por id', error: error.message });
  }
};

// buscar usuario por email -------------------------------------------
exports.getUserByEmail = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error al buscar usuario por email', error: error.message });
  }
};

// crear usuario ------------------------------------------------
exports.createUser = async (req, res) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Completa los campos obligatorios' });
  }

  try {
    const newUser = await User.create({ name, email, password });
    
    res.status(201).json({ 
      message: 'El usuario se ha creado correctamente',
      user: newUser
    });
  } catch (error) {
    if (error.code === 11000) {
        return res.status(409).json({ message: 'Este correo ya tiene una cuenta' });
    }
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message).join(', ');
        return res.status(400).json({ message: `Error de validación: ${messages}` });
    }
    res.status(500).json({ message: 'Error al crear usuario', error: error.message });
  }
};

// actualizar usuario ------------------------------------------------
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  let updateData = req.body;

  try {
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    
    delete updateData.email; 

    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({ message: 'El usuario se ha actualizado correctamente', user: updatedUser });
  } catch (error) {
    if (error.kind === 'ObjectId') {
        return res.status(400).json({ message: 'ID de usuario invalido' });
    }
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message).join(', ');
        return res.status(400).json({ message: `Error de validación: ${messages}` });
    }
    res.status(500).json({ message: 'Error al actualizar usuario', error: error.message });
  }
};

// eliminar usuario ------------------------------------------------
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  
  try {
    const deletedUser = await User.findByIdAndDelete(id);
    
    if (!deletedUser) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({ message: `El usuario ${deletedUser.email} se ha eliminado correctamente`, user: deletedUser });
  } catch (error) {
    if (error.kind === 'ObjectId') {
        return res.status(400).json({ message: 'El id del usuario es inválido' });
    }
    res.status(500).json({ message: 'Error al eliminar usuario', error: error.message });
  }
};