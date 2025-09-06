const Users = require('../models/Users');
const Events = require('../models/Events')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Créer un utilisateur
exports.createUser = async (req, res) =>{
    try{
        const { username, email, password } = req.body;
        const isUserExists = await Users.findOne({ email });
        if (isUserExists) {
            return res.status(400).json({
                message: "Cet utilisateur existe déjà"
            });
        }
        const user = await Users.create({ username, email, password })
        res.status(201).json({
            message: "utilisateur créé avec succès"
        });
    } catch (err) {
        res.status(500).json({
            message: `Problème lors de la création d'un utilisateur, ${err.message}`
        });
    }
};

// Se connecter à son compte
exports.loginUser = async (req, res) =>{
    try{
        const { email, password } = req.body;
        const user = await Users.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: "identifiants invalides"
            });
        };

        const checkPassword = await bcrypt.compare(password, user.password);
        if (!checkPassword) {
            return res.status(400).json({
                message: "identifiants invalides"
            });
        };

        const token = jwt.sign(
            {
                id: user._id
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch(err) {
        res.status(500).json({
            message: `Erreur server, ${err}`
        });
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

    res.json({
      user,
      events,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
