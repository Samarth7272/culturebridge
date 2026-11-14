const router = require("express").Router();
const mongoose = require("mongoose");
const Workshop = require("../models/Workshop");
const { protect } = require("../middleware/auth");

// List programmes/workshops.
router.get("/", protect(), async (req, res) => {
  try {
    const workshops = await Workshop.find()
      .populate("trainer", "name email")
      .populate("organisation", "name industry")
      .sort("-createdAt");

    const result = workshops.map((workshop) => {
      const data = workshop.toObject();
      const users = data.enrolledUsers || [];
      return {
        ...data,
        registered: users.length,
        enrolledByMe: users.some(
          (id) => id.toString() === req.user.id.toString()
        ),
      };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get one programme with its modules and lessons.
router.get("/:id", protect(), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid programme ID" });
    }

    const workshop = await Workshop.findById(req.params.id)
      .populate("trainer", "name email")
      .populate("organisation", "name industry");

    if (!workshop) {
      return res.status(404).json({ message: "Programme not found" });
    }

    res.json(workshop);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a programme/workshop.
router.post("/", protect("admin", "facilitator"), async (req, res) => {
  try {
    const {
      title, description, cat, date, capacity, facilitator,
      trainer, organisation, modules, status,
    } = req.body;

    if (!title || !date) {
      return res.status(400).json({
        message: "Programme title and date are required",
      });
    }

    const workshop = await Workshop.create({
      title,
      description: description || "",
      cat: cat || "General",
      date,
      capacity: Number(capacity) || 25,
      facilitator: facilitator || "",
      trainer: trainer || null,
      organisation: organisation || null,
      modules: Array.isArray(modules) ? modules : [],
      status: status === "Published" ? "Published" : "Draft",
    });

    res.status(201).json(workshop);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Learner enrols.
router.post("/:id/enroll", protect("learner"), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid programme ID" });
    }

    const workshop = await Workshop.findById(req.params.id);
    if (!workshop) {
      return res.status(404).json({ message: "Programme not found" });
    }
    if (workshop.status !== "Published") {
      return res.status(400).json({ message: "Programme is not published" });
    }

    const users = workshop.enrolledUsers || [];
    const userId = req.user.id.toString();

    if (users.some((id) => id.toString() === userId)) {
      return res.status(400).json({ message: "Already enrolled" });
    }
    if (workshop.capacity > 0 && users.length >= workshop.capacity) {
      return res.status(400).json({ message: "Programme is full" });
    }

    workshop.enrolledUsers.push(req.user.id);
    workshop.registered = workshop.enrolledUsers.length;
    await workshop.save();

    res.json({
      message: "Successfully enrolled",
      registered: workshop.registered,
      enrolledByMe: true,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Learner leaves.
router.delete("/:id/enroll", protect("learner"), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid programme ID" });
    }

    const workshop = await Workshop.findById(req.params.id);
    if (!workshop) {
      return res.status(404).json({ message: "Programme not found" });
    }

    const userId = req.user.id.toString();
    workshop.enrolledUsers = (workshop.enrolledUsers || []).filter(
      (id) => id.toString() !== userId
    );
    workshop.registered = workshop.enrolledUsers.length;
    await workshop.save();

    res.json({
      message: "Successfully unenrolled",
      registered: workshop.registered,
      enrolledByMe: false,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete (admin only).
router.delete("/:id", protect("admin"), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid programme ID" });
    }

    const workshop = await Workshop.findByIdAndDelete(req.params.id);
    if (!workshop) {
      return res.status(404).json({ message: "Programme not found" });
    }

    res.json({ message: "Programme deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update programme fields and module/lesson content.
router.patch("/:id", protect("admin", "facilitator"), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid programme ID" });
    }

    const allowedFields = [
      "title", "description", "cat", "date", "capacity",
      "facilitator", "trainer", "organisation", "modules",
      "status", "completed",
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    const workshop = await Workshop.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    )
      .populate("trainer", "name email")
      .populate("organisation", "name industry");

    if (!workshop) {
      return res.status(404).json({ message: "Programme not found" });
    }

    res.json(workshop);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
