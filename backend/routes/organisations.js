const router = require("express").Router();
const mongoose = require("mongoose");
const Organisation = require("../models/Organisation");
const { protect } = require("../middleware/auth");

// Get all organisations
router.get("/", protect("admin"), async (req, res) => {
  try {
    const organisations = await Organisation.find()
      .sort({ createdAt: -1 });

    res.json(organisations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create organisation
router.post("/", protect("admin"), async (req, res) => {
  try {
    const {
      name,
      industry,
      email,
      contactPerson,
      phone,
    } = req.body;

    if (!name?.trim() || !industry?.trim()) {
      return res.status(400).json({
        message: "Organisation name and industry are required.",
      });
    }

    const organisation = await Organisation.create({
      name: name.trim(),
      industry: industry.trim(),
      email: email?.trim().toLowerCase() || "",
      contactPerson: contactPerson?.trim() || "",
      phone: phone?.trim() || "",
      createdBy: req.user.id,
    });

    res.status(201).json(organisation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update organisation
router.patch("/:id", protect("admin"), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid organisation ID.",
      });
    }

    const allowed = [
      "name",
      "industry",
      "email",
      "contactPerson",
      "phone",
      "status",
    ];

    const updates = {};

    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        updates[key] =
          typeof req.body[key] === "string"
            ? req.body[key].trim()
            : req.body[key];
      }
    }

    if (updates.email !== undefined) {
      updates.email = updates.email.toLowerCase();
    }

    const organisation = await Organisation.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!organisation) {
      return res.status(404).json({
        message: "Organisation not found.",
      });
    }

    res.json(organisation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete organisation
router.delete("/:id", protect("admin"), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid organisation ID.",
      });
    }

    const organisation = await Organisation.findByIdAndDelete(
      req.params.id
    );

    if (!organisation) {
      return res.status(404).json({
        message: "Organisation not found.",
      });
    }

    res.json({ message: "Organisation deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;