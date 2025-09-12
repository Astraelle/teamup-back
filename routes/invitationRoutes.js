const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const invitationController = require("../controllers/invitationsController");

router.post("/", authMiddleware, invitationController.createInvitation);
router.get("/", authMiddleware, invitationController.getMyInvitations);
router.post("/:id/accept", authMiddleware, invitationController.acceptInvitation);
router.post("/:id/decline", authMiddleware, invitationController.declineInvitation);

module.exports = router;
