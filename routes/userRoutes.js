const express = require('express');
const { createUser, loginUser, deleteUser, exportUserData } = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware.js');

const router = express.Router();

router.post('/register', createUser);
router.post('/login', loginUser);
router.delete("/deleteme", authMiddleware, deleteUser);
router.get("/exportme", authMiddleware, exportUserData);

module.exports = router;