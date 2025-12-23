const Voluntariado = require('../models/Voluntariado');

// obtener los voluntariados --------------------------------
exports.getAllCards = async (req, res) => {
  try {
    const cards = await Voluntariado.find({}); 
    res.json(cards);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener voluntariados', error: error.message });
  }
};

// buscar voluntariado por id ---------------------------------------------
exports.getCardById = async (req, res) => {
  const { id } = req.params;
  try {
    const card = await Voluntariado.findById(id); 
    
    if (!card) {
      return res.status(404).json({ message: 'Voluntariado no encontrado' });
    }
    
    res.json(card);
  } catch (error) {
    if (error.kind === 'ObjectId') {
        return res.status(400).json({ message: 'El id del voluntariado es inválido' });
    }
    res.status(500).json({ message: 'Error al buscar voluntariado', error: error.message });
  }
};

// buscar voluntariados por email del autor -----------------------------
exports.getCardsByEmail = async (req, res) => {
  const { email } = req.body;
  try {
    const cards = await Voluntariado.find({ email: email });
    
    res.json(cards);
  } catch (error) {
    res.status(500).json({ message: 'Error al buscar voluntariados por email', error: error.message });
  }
};

// buscar voluntariados por tipo -----------------------------------------
exports.getCardsByType = async (req, res) => {
  const { type } = req.body;
  try {
    const cards = await Voluntariado.find({ volunType: type });
    
    res.json(cards);
  } catch (error) {
    res.status(500).json({ message: 'Error al buscar voluntariados por tipo', error: error.message });
  }
};

// crear voluntariado - -------------------------------------------------
exports.createCard = async (req, res) => {
  const { date, title, description, autor, volunType, email } = req.body;
  
  if (!date || !title || !description || !autor || !volunType || !email) {
    return res.status(400).json({ message: 'completa los campos obligatorios' });
  }

  try {
    const newCard = await Voluntariado.create({ 
      date, title, description, autor, volunType, email
    });
    
    res.status(201).json({ 
      message: 'Voluntariado creado correctamente',
      card: newCard
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message).join(', ');
        return res.status(400).json({ message: `Error de validación: ${messages}` });
    }
    res.status(500).json({ message: 'Error al crear voluntariado', error: error.message });
  }
};

// actualizar voluntariado ------------------------------------------------
exports.updateCard = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const updatedCard = await Voluntariado.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedCard) {
      return res.status(404).json({ message: 'Voluntariado no encontrado' });
    }

    res.json({ message: 'el voluntariado se ha actualizado correctamente', card: updatedCard });
  } catch (error) {
    if (error.kind === 'ObjectId') {
        return res.status(400).json({ message: 'El id del voluntariado es inválido' });
    }
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message).join(', ');
        return res.status(400).json({ message: `Error de validación: ${messages}` });
    }
    res.status(500).json({ message: 'Error al actualizar voluntariado', error: error.message });
  }
};

// eliminar voluntariado ------------------------------------------------
exports.deleteCard = async (req, res) => {
  const { id } = req.params;
  
  try {
    const deletedCard = await Voluntariado.findByIdAndDelete(id);
    
    if (!deletedCard) {
      return res.status(404).json({ message: 'Voluntariado no encontrado' });
    }

    res.json({ message: `Voluntariado con ID ${deletedCard.id} eliminado correctamente`, card: deletedCard });
  } catch (error) {
    if (error.kind === 'ObjectId') {
        return res.status(400).json({ message: 'El id del voluntariado es inválido' });
    }
    res.status(500).json({ message: 'Error al eliminar voluntariado', error: error.message });
  }
};