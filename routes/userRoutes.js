const express = require('express');
const {
  createUser,
  loginUser,
  deleteUser,
  exportUserData,
  updateProfile, // ✅ on ajoute la nouvelle méthode
} = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware.js');

const router = express.Router();

// 🔹 Authentification & compte
router.post('/register', createUser);
router.post('/login', loginUser);
router.delete('/deleteme', authMiddleware, deleteUser);
router.get('/exportme', authMiddleware, exportUserData);

// 🔹 Profil sportif (ajouté)
router.put('/update-profile', authMiddleware, updateProfile);

module.exports = router;
