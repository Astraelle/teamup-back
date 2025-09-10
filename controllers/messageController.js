const Messages = require("../models/Messages");
const Teams = require("../models/Teams");

// Récupérer tous les messages d’une équipe
exports.getMessages = async (req, res) => {
  try {
    const team = await Teams.findById(req.params.id);
    if (!team) return res.status(404).json({ message: "Équipe introuvable" });

    // Vérifier que l’utilisateur fait partie de l’équipe
    if (!team.members.includes(req.user.id)) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const messages = await Messages.find({ team: req.params.id })
      .populate("sender", "username email")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Envoyer un message
exports.sendMessage = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: "Message vide" });

    const team = await Teams.findById(req.params.id);
    if (!team) return res.status(404).json({ message: "Équipe introuvable" });

    if (!team.members.includes(req.user.id)) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const message = await Messages.create({
      team: req.params.id,
      sender: req.user.id,
      content,
    });

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Supprimer un message (optionnel : seulement l’auteur ou admin)
exports.deleteMessage = async (req, res) => {
  try {
    const message = await Messages.findById(req.params.messageId);
    if (!message) return res.status(404).json({ message: "Message introuvable" });

    if (message.sender.toString() !== req.user.id) {
      return res.status(403).json({ message: "Suppression non autorisée" });
    }

    await message.deleteOne();
    res.json({ message: "Message supprimé" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
