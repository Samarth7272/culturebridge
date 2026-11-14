const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Organisation = require("../models/Organisation");
const { protect } = require("../middleware/auth");

const router = express.Router();

// All routes below require an Admin login
router.use(protect("admin"));

// GET /api/users
// Get all users with organisation details
router.get("/", async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .populate("organisation", "name industry")
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Unable to fetch users." });
  }
});

// POST /api/users
// Admin creates an employee or facilitator
router.post("/", async (req, res) => {
  try {
    const { name, email, password, role, organisation } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        message: "Name, email and password are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters.",
      });
    }

    if (!["learner", "facilitator"].includes(role)) {
      return res.status(400).json({
        message: "Only learner and facilitator accounts can be created here.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({
        message: "This email is already registered.",
      });
    }

    if (organisation) {
      if (!mongoose.Types.ObjectId.isValid(organisation)) {
        return res.status(400).json({
          message: "Invalid organisation ID.",
        });
      }

      const orgExists = await Organisation.findById(organisation);

      if (!orgExists) {
        return res.status(404).json({
          message: "Organisation not found.",
        });
      }

      if (orgExists.status !== "Active") {
        return res.status(400).json({
          message: "Cannot assign a user to an inactive organisation.",
        });
      }
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: await bcrypt.hash(password, 10),
      role,
      organisation: organisation || null,
      status: "Active",
    });

    const safeUser = await User.findById(user._id)
      .select("-password")
      .populate("organisation", "name industry");

    res.status(201).json(safeUser);
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({ message: "Unable to create user." });
  }
});

// PATCH /api/users/:id
// Update user details, role, organisation or status
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID." });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const { name, email, role, organisation, status } = req.body;

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ message: "Name cannot be empty." });
      }
      user.name = name.trim();
    }

    if (email !== undefined) {
      const normalizedEmail = email.trim().toLowerCase();

      const duplicate = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: id },
      });

      if (duplicate) {
        return res.status(409).json({
          message: "This email is already in use.",
        });
      }

      user.email = normalizedEmail;
    }

    if (role !== undefined) {
      if (!["learner", "facilitator"].includes(role)) {
        return res.status(400).json({
          message: "Invalid role.",
        });
      }
      user.role = role;
    }

    if (organisation !== undefined) {
      if (organisation === null || organisation === "") {
        user.organisation = null;
      } else {
        if (!mongoose.Types.ObjectId.isValid(organisation)) {
          return res.status(400).json({
            message: "Invalid organisation ID.",
          });
        }

        const orgExists = await Organisation.findById(organisation);

        if (!orgExists || orgExists.status !== "Active") {
          return res.status(400).json({
            message: "Select an existing active organisation.",
          });
        }

        user.organisation = organisation;
      }
    }

    if (status !== undefined) {
      if (!["Active", "Inactive"].includes(status)) {
        return res.status(400).json({
          message: "Invalid account status.",
        });
      }
      user.status = status;
    }

    await user.save();

    const safeUser = await User.findById(user._id)
      .select("-password")
      .populate("organisation", "name industry");

    res.json(safeUser);
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "Unable to update user." });
  }
});

// DELETE /api/users/:id
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID." });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (String(user._id) === String(req.user.id)) {
      return res.status(400).json({
        message: "You cannot delete your own admin account.",
      });
    }

    if (user.role === "admin") {
      return res.status(403).json({
        message: "Admin accounts cannot be deleted here.",
      });
    }

    await User.findByIdAndDelete(id);

    res.json({ message: "User deleted successfully." });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Unable to delete user." });
  }
});

module.exports = router;