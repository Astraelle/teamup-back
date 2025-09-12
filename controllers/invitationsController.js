const Invitations = require("../models/Invitations");
const Events = require("../models/Events");
const Teams = require("../models/Teams");
const teamController = require("./teamController");

// 📩 Créer une invitation
exports.createInvitation = async (req, res) => {
  try {
    const { to, type, event, team } = req.body;

    if (!to || !type) {
      return res.status(400).json({ message: "Destinataire et type obligatoires" });
    }

    if (type === "event" && !event) {
      return res.status(400).json({ message: "L'ID de l'événement est requis" });
    }
    if (type === "team" && !team) {
      return res.status(400).json({ message: "L'ID de l'équipe est requis" });
    }

    const invitation = await Invitations.create({
      from: req.user.id,
      to,
      type,
      event,
      team,
    });

    res.status(201).json(invitation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📜 Lister les invitations reçues
exports.getMyInvitations = async (req, res) => {
  try {
    const invitations = await Invitations.find({ to: req.user.id, status: "pending" })
      .populate("from", "username email")
      .populate("event", "title date startTime")
      .populate("team", "name");

    res.json(invitations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Accepter une invitation
exports.acceptInvitation = async (req, res) => {
  try {
    const invitation = await Invitations.findById(req.params.id);
    if (!invitation) return res.status(404).json({ message: "Invitation introuvable" });

    if (invitation.to.toString() !== req.user.id) {
      return res.status(403).json({ message: "Non autorisé" });
    }

    if (invitation.status !== "pending") {
      return res.status(400).json({ message: "Invitation déjà traitée" });
    }

    // Ajout en fonction du type
    if (invitation.type === "event" && invitation.event) {
      const event = await Events.findById(invitation.event);
      if (!event) return res.status(404).json({ message: "Événement introuvable" });

      if (!event.participants.includes(req.user.id)) {
        event.participants.push(req.user.id);
        await event.save();
      }
    }

    if (invitation.type === "team" && invitation.team) {
      await teamController.addMember(invitation.team, req.user.id);
    }

    invitation.status = "accepted";
    await invitation.save();

    res.json({ message: "Invitation acceptée", invitation });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ❌ Refuser une invitation
exports.declineInvitation = async (req, res) => {
  try {
    const invitation = await Invitations.findById(req.params.id);
    if (!invitation) return res.status(404).json({ message: "Invitation introuvable" });

    if (invitation.to.toString() !== req.user.id) {
      return res.status(403).json({ message: "Non autorisé" });
    }

    invitation.status = "declined";
    await invitation.save();

    res.json({ message: "Invitation refusée", invitation });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
