const router = require("express").Router();
const Workshop = require("../models/Workshop");
const { protect } = require("../middleware/auth");

// All authenticated users can view workshops
router.get("/", protect(), async (req, res) => {
  try {
    const workshops = await Workshop.find().sort("-createdAt");
    res.json(workshops);
  } catch (error) {
    res.status(500).json({ message: "Unable to fetch workshops" });
  }
});

// Admin and trainer can create workshops
router.post("/", protect("admin", "facilitator"), async (req, res) => {
  try {
    const {
      title,
      cat,
      date,
      capacity,
      facilitator,
      status,
    } = req.body;

    if (!title) {
      return res.status(400).json({
        message: "Workshop title is required",
      });
    }

    const workshop = await Workshop.create({
      title,
      cat,
      date,
      capacity,
      facilitator,
      status,
    });

    res.status(201).json(workshop);
  } catch (error) {
    res.status(500).json({ message: "Unable to create workshop" });
  }
});

// Only admin can delete workshops
router.delete("/:id", protect("admin"), async (req, res) => {
  try {
    const workshop = await Workshop.findByIdAndDelete(req.params.id);

    if (!workshop) {
      return res.status(404).json({ message: "Workshop not found" });
    }

    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: "Unable to delete workshop" });
  }
});

// Admin and trainer can update workshop details
router.patch("/:id", protect("admin", "facilitator"), async (req, res) => {
  try {
    const allowedFields = [
      "title",
      "cat",
      "date",
      "capacity",
      "facilitator",
      "status",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const workshop = await Workshop.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!workshop) {
      return res.status(404).json({ message: "Workshop not found" });
    }

    res.json(workshop);
  } catch (error) {
    res.status(500).json({ message: "Unable to update workshop" });
  }
});

module.exports = router;