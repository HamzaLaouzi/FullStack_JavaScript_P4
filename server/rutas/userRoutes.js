const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// crud de los usuarios ------------------------------------------------
router.get('/', userController.getAllUsers); // /api/users
router.get('/:id', userController.getUserById); // /api/users/:id
router.post('/by-email', userController.getUserByEmail); // /api/users/by-email + body
router.post('/', userController.createUser); // /api/users
router.put('/:id', userController.updateUser); // /api/users/:id
router.delete('/:id', userController.deleteUser); // /api/users/:id

module.exports = router;