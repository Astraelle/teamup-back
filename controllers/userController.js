const Users = require('../models/Users');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

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