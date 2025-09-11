const Events = require('../models/Events.js');

// 🔹 Créer un événement
exports.createEvent = async (req, res) => {
  try {
    const { title, description, date, startTime, location } = req.body; // ✅ on récupère startTime
    const userId = req.user.id;

    if (!date || !startTime) {
      return res.status(400).json({ message: "La date et l'heure de début sont obligatoires." });
    }

    const event = await Events.create({
      title,
      description,
      date,       // 📌 uniquement la date (YYYY-MM-DD)
      startTime,  // 📌 l'heure (HH:mm)
      location,
      createdBy: userId,
      participants: [userId], // ✅ créateur auto-inscrit
      status: "open",         // ✅ par défaut l'événement est ouvert
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Récupérer tous les événements
exports.getEvents = async (req, res) => {
  try {
    const events = await Events.find()
      .populate("createdBy", "username")
      .populate("participants", "username email");

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Récupérer un événement par ID
exports.getEventById = async (req, res) => {
  try {
    const event = await Events.findById(req.params.id)
      .populate("createdBy", "username")
      .populate("participants", "username email");

    if (!event) return res.status(404).json({ message: "Événement introuvable" });
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Récupérer mes événements
exports.getMyEvents = async (req, res) => {
  try {
    const events = await Events.find({ createdBy: req.user.id })
      .populate("participants", "username email");

    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔹 Mettre à jour un événement
exports.updateEvent = async (req, res) => {
  try {
    const event = await Events.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Événement introuvable" });

    if (event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Non autorisé" });
    }

    const { title, description, date, startTime, location } = req.body;
    if (!date || !startTime) {
      return res.status(400).json({ message: "La date et l'heure sont obligatoires." });
    }

    event.title = title || event.title;
    event.description = description || event.description;
    event.date = date || event.date;
    event.startTime = startTime || event.startTime;
    event.location = location || event.location;

    const updatedEvent = await event.save();
    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Supprimer un événement
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

// 🔹 Rejoindre un événement
exports.joinEvent = async (req, res) => {
  try {
    const event = await Events.findById(req.params.id);

    if (!event) return res.status(404).json({ message: "Événement introuvable" });

    if (event.status !== "open") {
      return res.status(400).json({ message: "Cet événement n'accepte plus d'inscriptions." });
    }

    if (event.maxParticipants > 0 && event.participants.length >= event.maxParticipants) {
      return res.status(400).json({ message: "Capacité maximale atteinte." });
    }

    if (event.participants.includes(req.user.id)) {
      return res.status(400).json({ message: "Vous êtes déjà inscrit à cet événement." });
    }

    if (event.participants.some(p => p.toString() === req.user.id)) {
      return res.status(400).json({ message: "Vous êtes déjà inscrit à cet événement." });
    }

    event.participants.push(req.user.id);
    await event.save();

    res.json({ message: "Inscription réussie", event });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Quitter un événement
exports.leaveEvent = async (req, res) => {
  try {
    const event = await Events.findById(req.params.id);

    if (!event) return res.status(404).json({ message: "Événement introuvable" });

    event.participants = event.participants.filter(
      (p) => p.toString() !== req.user.id
    );

    await event.save();

    res.json({ message: "Vous avez quitté l'événement", event });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Annuler un événement
exports.cancelEvent = async (req, res) => {
  try {
    const event = await Events.findById(req.params.id);

    if (!event) return res.status(404).json({ message: "Événement introuvable" });

    if (event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Non autorisé" });
    }

    event.status = "cancelled";
    await event.save();

    res.json({ message: "Événement annulé", event });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Recherche par géolocalisation
exports.searchEventsByLocation = async (req, res) => {
  try {
    const { lng, lat, distance = 5000 } = req.query;

    if (!lng || !lat) {
      return res.status(400).json({ message: "Longitude et latitude sont obligatoires." });
    }

    const events = await Events.find({
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseInt(distance), // en mètres
        },
      },
    }).populate("createdBy", "username");

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
