const Teams = require("../models/Teams");

// Créer une équipe
exports.createTeam = async (req, res) => {
  try {
    const { name, members } = req.body; // members = emails

    // Convertir les emails en IDs
    const users = await Users.find({ email: { $in: members } });
    if (users.length !== members.length) {
      return res.status(400).json({ message: "Certains emails n'existent pas" });
    }

    const userIds = users.map(u => u._id);

    const team = await Teams.create({
      name,
      creator: req.user.id,
      members: [req.user.id, ...userIds],
    });

    res.status(201).json(team);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Mes équipes
exports.getUserTeams = async (req, res) => {
  try {
    const teams = await Teams.find({ members: req.user.id }).populate("members", "username email");
    res.json(teams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Détail d’une équipe
exports.getTeamById = async (req, res) => {
  try {
    const team = await Teams.findById(req.params.id).populate("members", "username email");
    if (!team) return res.status(404).json({ message: "Équipe introuvable" });
    res.json(team);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Rejoindre une équipe
exports.joinTeam = async (req, res) => {
  try {
    const team = await exports.addMember(req.params.id, req.user.id);
    res.json(team);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Quitter une équipe
exports.leaveTeam = async (req, res) => {
  try {
    const team = await Teams.findById(req.params.id);
    if (!team) return res.status(404).json({ message: "Équipe introuvable" });

    team.members = team.members.filter(m => m.toString() !== req.user.id);
    await team.save();

    res.json({ message: "Équipe quittée avec succès" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Supprimer une équipe (seul le créateur peut supprimer)
exports.deleteTeam = async (req, res) => {
  try {
    const team = await Teams.findById(req.params.id);
    if (!team) return res.status(404).json({ message: "Équipe introuvable" });

    if (team.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: "Seul le créateur peut supprimer l’équipe" });
    }

    await team.deleteOne();
    res.json({ message: "Équipe supprimée avec succès" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTeamMembers = async (req, res) => {
  try {
    const team = await Teams.findById(req.params.id)
      .populate("members", "username email")
      .populate("creator", "username email");

    if (!team) return res.status(404).json({ message: "Équipe introuvable" });

    res.json({
      creator: team.creator,
      members: team.members,
    });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// Ajouter un membre (utilisé par le système d'invitations)
exports.addMember = async (teamId, userId) => {
  const team = await Teams.findById(teamId);
  if (!team) throw new Error("Équipe introuvable");

  if (!team.members.includes(userId)) {
    team.members.push(userId);
    await team.save();
  }

  return await team.populate("members", "username email");
};