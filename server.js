const mongoose = require("mongoose");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

dotenv.config();

const app = require("./app");
const Messages = require("./models/Messages"); // ✅ ton modèle de messages

const PORT = process.env.PORT || 5000;

// --- Création du serveur HTTP
const server = http.createServer(app);

// --- Initialisation de Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*", // à restreindre à ton front en prod
    methods: ["GET", "POST"],
  },
});

// Middleware d’authentification Socket.IO
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("No token provided"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error("Authentication error"));
  }
});

// Gestion des connexions
io.on("connection", (socket) => {
  console.log(`🔗 Utilisateur connecté : ${socket.user.id}`);

  // Rejoindre une équipe
  socket.on("join_team", (teamId) => {
    socket.join(teamId);
    console.log(`👥 ${socket.user.id} a rejoint l’équipe ${teamId}`);
  });

  // Quitter une équipe
  socket.on("leave_team", (teamId) => {
    socket.leave(teamId);
    console.log(`👋 ${socket.user.id} a quitté l’équipe ${teamId}`);
  });

  // Envoyer un message
  socket.on("send_message", async ({ teamId, content }) => {
    if (!content) return;

    try {
      const message = await Messages.create({
        team: teamId,
        sender: socket.user.id,
        content,
      });

      io.to(teamId).emit("receive_message", {
        _id: message._id,
        team: teamId,
        sender: socket.user.id,
        content: message.content,
        createdAt: message.createdAt,
      });
    } catch (err) {
      console.error("Erreur enregistrement message :", err);
    }
  });

  socket.on("disconnect", () => {
    console.log(`❌ Déconnecté : ${socket.user.id}`);
  });
});

// --- Connexion MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connecté à MongoDB");
    server.listen(PORT, () =>
      console.log(`🚀 Serveur + WebSocket démarré sur http://localhost:${PORT}`)
    );
  })
  .catch((err) => console.error(err));
