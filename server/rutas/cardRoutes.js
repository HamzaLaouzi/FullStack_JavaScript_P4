const express = require('express');
const router = express.Router();
const cardController = require('../controllers/cardController');
const { auth, isAdmin } = require('../auth');

// Rutas públicas (lectura)
router.get('/', cardController.getCards); // Asegúrate que en tu controlador se llame getCards o getAllVoluntariados

// Rutas privadas (escritura) - Solo usuarios autenticados
router.post('/', auth, cardController.createCard);

// Rutas de administrador (borrar)
router.delete('/:id', [auth, isAdmin], cardController.deleteCard);

module.exports = router;