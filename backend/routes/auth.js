const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const router = express.Router();

const sign = (u) =>
  jwt.sign({ id: u._id, role: u.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });
    if (await User.findOne({ email }))
      return res.status(400).json({ message: "Email already registered" });

    // people may only self-register as learner or facilitator, never admin
    const safeRole = role === "facilitator" ? "facilitator" : "learner";
    const user = await User.create({
      name, email, role: safeRole,
      password: await bcrypt.hash(password, 10),
    });
    res.status(201).json({ token: sign(user), user: { id: user._id, name, email, role: user.role } });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(400).json({ message: "Invalid email or password" });
    res.json({ token: sign(user), user: { id: user._id, name: user.name, email, role: user.role } });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;