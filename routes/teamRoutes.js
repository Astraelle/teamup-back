const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const teamController = require("../controllers/teamController");
const messageController = require("../controllers/messageController");
const Team = require("../models/Teams");

// 🔹 Routes pour les équipes
router.post("/create", authMiddleware, teamController.createTeam); // créer une équipe
router.get("/get", authMiddleware, teamController.getUserTeams); // mes équipes
router.get("/:id", authMiddleware, teamController.getTeamById); // détail équipe
router.post("/:id/join", authMiddleware, teamController.joinTeam); // rejoindre
router.post("/:id/leave", authMiddleware, teamController.leaveTeam); // quitter
router.delete("/:id", authMiddleware, teamController.deleteTeam); // supprimer
router.get("/:id/members", authMiddleware, teamController.getTeamMembers);

// 🔹 Routes pour les messages d’une équipe
router.get("/:id/messages", authMiddleware, messageController.getMessages); // récupérer
router.post("/:id/messages", authMiddleware, messageController.sendMessage); // envoyer
router.delete("/:teamId/messages/:messageId", authMiddleware, messageController.deleteMessage); // supprimer

module.exports = router;
