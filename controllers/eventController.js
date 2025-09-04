const Events = require('../models/Events.js')

// Créer un événement
exports.createEvent = async (req, res) => {
  try {
    const { title, description, date, location } = req.body;
    const event = await Events.create({
      title,
      description,
      date,
      location,
      createdBy: req.user.id,
    });
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Récupérer tous les événements
exports.getEvents = async (req, res) => {
  try {
    const events = await Events.find().populate("createdBy", "username");
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Récupérer un événement par ID
exports.getEventById = async (req, res) => {
  try {
    const event = await Events.findById(req.params.id).populate("createdBy", "username");
    if (!event) return res.status(404).json({ message: "Événement introuvable" });
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mettre à jour un événement
exports.updateEvent = async (req, res) => {
  try {
    const event = await Events.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Événement introuvable" });

    // Vérifie si l'utilisateur est le créateur
    if (event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Non autorisé" });
    }

    const updatedEvent = await Events.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Supprimer un événement
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Events.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Événement introuvable" });

    if (event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Non autorisé" });
    }

    await event.deleteOne();
    res.json({ message: "Événement supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Recherche par géolocalisation
exports.searchEventsByLocation = async (req, res) => {
  try {
    const { lng, lat, distance } = req.query; // ex: /search/location?lng=2.34&lat=48.85&distance=5000
    const events = await Events.find({
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseInt(distance) || 5000, // par défaut 5 km
        },
      },
    });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
