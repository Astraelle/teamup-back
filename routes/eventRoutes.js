const express = require('express');
const { createEvent, getEvents, getEventById, getMyEvents, updateEvent, deleteEvent, searchEventsByLocation } = require('../controllers/eventController.js');
const authMiddleware = require('../middlewares/authMiddleware.js');

const router = express.Router();

// Routes publiques
router.get("/get", getEvents);
router.get("/get/:id", getEventById);
router.get("/search/location", searchEventsByLocation);

// Routes protégées (authentification requise)
router.get("/mine", authMiddleware, getMyEvents);
router.post("/publish", authMiddleware, createEvent);
router.put("/modify/:id", authMiddleware, updateEvent);
router.delete("/delete/:id", authMiddleware, deleteEvent);

module.exports = router;