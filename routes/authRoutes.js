const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const Users = require('../models/Users');

const router = express.Router();

router.get('/validate', authMiddleware, async (req, res) => {
  try {
    // req.user.id vient du token
    const user = await Users.findById(req.user.id).select('-password'); // on enlève le mot de passe
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.json({
      valid: true,
      user, // ici tu renvoies toutes les infos nécessaires
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
