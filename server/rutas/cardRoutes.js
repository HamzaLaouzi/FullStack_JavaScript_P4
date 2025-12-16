const express = require('express');
const router = express.Router();
const cardController = require('../controllers/cardController');

// crud voluntariados ------------------------------------------------
router.get('/', cardController.getAllCards); // /api/cards
router.get('/:id', cardController.getCardById); // /api/cards/:id
router.post('/by-email', cardController.getCardsByEmail); // /api/cards/by-email + body
router.post('/by-type', cardController.getCardsByType); // /api/cards/by-type + body
router.post('/', cardController.createCard); // /api/cards
router.put('/:id', cardController.updateCard); // /api/cards/:id
router.delete('/:id', cardController.deleteCard); // /api/cards/:id

module.exports = router;