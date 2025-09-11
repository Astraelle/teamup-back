const express = require('express');
const { 
  createEvent, 
  getEvents, 
  getEventById, 
  getMyEvents, 
  updateEvent, 
  deleteEvent, 
  searchEventsByLocation,
  joinEvent,
  leaveEvent,
  cancelEvent
} = require('../controllers/eventController.js');

const authMiddleware = require('../middlewares/authMiddleware.js');

const router = express.Router();

// 🔹 Routes publiques
router.get("/get", getEvents);
router.get("/get/:id", getEventById);
router.get("/search/location", searchEventsByLocation);

// 🔹 Routes protégées (authentification requise)
router.get("/mine", authMiddleware, getMyEvents);
router.post("/publish", authMiddleware, createEvent);
router.put("/modify/:id", authMiddleware, updateEvent);
router.delete("/delete/:id", authMiddleware, deleteEvent);

// 🔹 Participation aux événements
router.post("/:id/join", authMiddleware, joinEvent);   // rejoindre un événement
router.post("/:id/leave", authMiddleware, leaveEvent); // quitter un événement

// 🔹 Annulation d’un événement par le créateur
router.post("/:id/cancel", authMiddleware, cancelEvent);

module.exports = router;
