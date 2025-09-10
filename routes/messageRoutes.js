const express = require("express");
const router = express.Router();
const Messages = require("../models/Messages");
const authMiddleware = require("../middlewares/authMiddleware");

// ✅ Récupérer l’historique des messages d’une équipe
router.get("/:teamId", authMiddleware, async (req, res) => {
  try {
    const { teamId } = req.params;

    const messages = await Messages.find({ team: teamId })
      .populate("sender", "username email") // infos du sender
      .sort({ createdAt: 1 }); // tri chronologique

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

module.exports = router;
