const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');
const teamRoutes = require("./routes/teamRoutes");
const authRoutes = require('./routes/authRoutes');
const messageRoutes = require("./routes/messageRoutes");

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});

app.use(limiter);

app.use("/api/users", userRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/teams", teamRoutes);
app.use('/api/auth', authRoutes);
app.use("/api/messages", messageRoutes);

app.use((err, req, res, next) =>{
    console.error(err.stack);
    res.status(500).json({
        message: "Erreur server"
    })
});

module.exports = app;