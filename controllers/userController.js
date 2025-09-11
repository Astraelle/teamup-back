const Users = require('../models/Users');
const Events = require('../models/Events');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Créer un utilisateur
exports.createUser = async (req, res) => {
  try {
    const { username, email, password, sports, level, availability } = req.body;

    const isUserExists = await Users.findOne({ email });
    if (isUserExists) {
      return res.status(400).json({ message: "Cet utilisateur existe déjà" });
    }

    const user = await Users.create({
      username,
      email,
      password,
      sports: sports || [],
      level: level || "Débutant",
      availability: availability || { days: [], times: [] },
    });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      message: "Utilisateur créé avec succès",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        sports: user.sports,
        level: user.level,
        availability: user.availability,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: `Problème lors de la création d'un utilisateur, ${err.message}`,
    });
  }
};

// Se connecter à son compte
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Users.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Identifiants invalides" });
    }

    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
      return res.status(400).json({ message: "Identifiants invalides" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        sports: user.sports,
        level: user.level,
        availability: user.availability,
      },
    });
  } catch (err) {
    res.status(500).json({ message: `Erreur serveur, ${err}` });
  }
};

// ✅ Modifier son profil (sport, niveau, disponibilités)
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, sports, level, availability } = req.body;

    const user = await Users.findByIdAndUpdate(
      userId,
      {
        ...(username && { username }),
        ...(sports && { sports }),
        ...(level && { level }),
        ...(availability && { availability }),
      },
      { new: true }
    ).select("-password");

    res.json({
      message: "Profil mis à jour avec succès",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Supprimer son propre compte
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.user.id;

    await Events.deleteMany({ createdBy: userId });
    await Users.findByIdAndDelete(userId);

    res.json({ message: "Compte et événements associés supprimés" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Exporter ses données personnelles
exports.exportUserData = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await Users.findById(userId).select("-password");
    const events = await Events.find({ createdBy: userId });

    res.json({ user, events });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
