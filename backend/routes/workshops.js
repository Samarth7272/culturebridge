const router = require("express").Router();
const mongoose = require("mongoose");
const Workshop = require("../models/Workshop");
const { protect } = require("../middleware/auth");

// Get workshops
router.get("/", protect(), async (req, res) => {
  try {
    const workshops = await Workshop.find().sort("-createdAt");

    const result = workshops.map((w) => {
      const data = w.toObject();
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

// Create workshop
router.post("/", protect("admin", "facilitator"), async (req, res) => {
  try {
    const { title, cat, date, capacity, facilitator, status } = req.body;

    if (!title || !date) {
      return res.status(400).json({
        message: "Workshop title and date are required",
      });
    }

    const workshop = await Workshop.create({
      title,
      cat,
      date,
      capacity,
      facilitator,
      status: status === "Published" ? "Published" : "Draft",
    });

    res.status(201).json(workshop);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Employee enrols
router.post("/:id/enroll", protect("learner"), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid workshop ID" });
    }

    const workshop = await Workshop.findById(req.params.id);

    if (!workshop) {
      return res.status(404).json({ message: "Workshop not found" });
    }

    if (workshop.status !== "Published") {
      return res.status(400).json({ message: "Workshop is not published" });
    }

    const users = workshop.enrolledUsers || [];
    const userId = req.user.id.toString();

    if (users.some((id) => id.toString() === userId)) {
      return res.status(400).json({ message: "Already enrolled" });
    }

    if (workshop.capacity > 0 && users.length >= workshop.capacity) {
      return res.status(400).json({ message: "Workshop is full" });
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

// Employee leaves
router.delete("/:id/enroll", protect("learner"), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid workshop ID" });
    }

    const workshop = await Workshop.findById(req.params.id);

    if (!workshop) {
      return res.status(404).json({ message: "Workshop not found" });
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

// Delete workshop (admin only)
router.delete("/:id", protect("admin"), async (req, res) => {
  try {
    const workshop = await Workshop.findByIdAndDelete(req.params.id);

    if (!workshop) {
      return res.status(404).json({ message: "Workshop not found" });
    }

    res.json({ message: "Workshop deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update workshop (admin or facilitator)
router.patch("/:id", protect("admin", "facilitator"), async (req, res) => {
  try {
    const { title, cat, date, capacity, facilitator, status, completed } =
      req.body;

    const updates = {};

    if (title !== undefined) updates.title = title;
    if (cat !== undefined) updates.cat = cat;
    if (date !== undefined) updates.date = date;
    if (capacity !== undefined) updates.capacity = capacity;
    if (facilitator !== undefined) updates.facilitator = facilitator;
    if (status !== undefined) updates.status = status;
    if (completed !== undefined) updates.completed = completed;

    const workshop = await Workshop.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!workshop) {
      return res.status(404).json({ message: "Workshop not found" });
    }

    res.json(workshop);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;