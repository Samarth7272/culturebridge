const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");

const User = require("../models/User");

const router = express.Router();
const googleClient = new OAuth2Client();

// =====================================
// JWT AND AUTH RESPONSE
// =====================================

const sign = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

const authResponse = (user) => ({
  token: sign(user),
  user: {
    id: String(user._id),
    _id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    organisation: user.organisation || null,
  },
});

// =====================================
// REGISTER WITH EMAIL AND PASSWORD
// =====================================

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body || {};

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedName || !normalizedEmail || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    // Public registration cannot create admin accounts.
    const safeRole =
      role === "facilitator" ? "facilitator" : "learner";

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password: hashedPassword,
      role: safeRole,
    });

    return res.status(201).json(authResponse(user));
  } catch (error) {
    console.error("Registration error:", error);

    if (error && error.code === 11000) {
      return res.status(409).json({
        message: "Email is already registered",
      });
    }

    return res.status(500).json({
      message: "Registration failed",
    });
  }
});

// =====================================
// LOGIN WITH EMAIL AND PASSWORD
// =====================================

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (
      !user ||
      !user.password ||
      !(await bcrypt.compare(password, user.password))
    ) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    if (user.status === "Inactive") {
      return res.status(403).json({
        message: "Your account is inactive. Contact your administrator.",
      });
    }

    return res.json(authResponse(user));
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Login failed",
    });
  }
});

// =====================================
// GOOGLE SIGN-IN AND SIGN-UP
// =====================================

router.post("/google", async (req, res) => {
  try {
    const { idToken, intent, role } = req.body || {};

    // Validate Google ID token.
    if (
      typeof idToken !== "string" ||
      !idToken.trim() ||
      idToken.length > 10000
    ) {
      return res.status(400).json({
        message: "A valid Google ID token is required",
      });
    }

    // Validate authentication intent.
    if (!["signin", "signup"].includes(intent)) {
      return res.status(400).json({
        message: "Invalid Google authentication intent",
      });
    }

    // Public Google registration cannot create admin accounts.
    if (
      intent === "signup" &&
      !["learner", "facilitator"].includes(role)
    ) {
      return res.status(400).json({
        message: "Select Learner or Facilitator",
      });
    }

    // Read the Web OAuth Client ID from backend environment.
    const webClientId = process.env.GOOGLE_WEB_CLIENT_ID;

    if (!webClientId) {
      console.error("GOOGLE_WEB_CLIENT_ID is missing");

      return res.status(503).json({
        message: "Google authentication is not configured",
      });
    }

    // =====================================
    // VERIFY GOOGLE ID TOKEN
    // =====================================

    let ticket;

    try {
      ticket = await googleClient.verifyIdToken({
        idToken: idToken.trim(),
        audience: webClientId,
      });
    } catch (verificationError) {
      console.error(
        "Google token verification failed:",
        verificationError.message
      );

      return res.status(401).json({
        message: "Google identity verification failed",
      });
    }

    const googlePayload = ticket.getPayload();

    if (
      !googlePayload ||
      !googlePayload.sub ||
      !googlePayload.email ||
      googlePayload.email_verified !== true
    ) {
      return res.status(401).json({
        message: "Google account email is not verified",
      });
    }

    const googleId = googlePayload.sub;
    const normalizedEmail = googlePayload.email.trim().toLowerCase();

    // =====================================
    // GOOGLE SIGN-UP
    // =====================================

    if (intent === "signup") {
      const existingUser = await User.findOne({
        $or: [
          { email: normalizedEmail },
          { googleId: googleId },
        ],
      });

      if (existingUser) {
        return res.status(409).json({
          message:
            "An account already exists with this email. Please sign in instead.",
        });
      }

      const name =
        (googlePayload.name || "").trim() ||
        googlePayload.given_name ||
        normalizedEmail.split("@")[0];

      // The existing User schema requires a password.
      // Generate a random password and store only its hash.
      const randomPassword = crypto
        .randomBytes(48)
        .toString("hex");

      const hashedPassword = await bcrypt.hash(
        randomPassword,
        12
      );

      const user = await User.create({
        name,
        email: normalizedEmail,
        password: hashedPassword,
        googleId: googleId,
        role: role,
        status: "Active",
      });

      return res.status(201).json(authResponse(user));
    }

    // =====================================
    // GOOGLE SIGN-IN
    // =====================================

    // First look for an account already linked to this Google ID.
    let user = await User.findOne({
      googleId: googleId,
    });

    // If not linked, look for an existing account by verified email.
    if (!user) {
      user = await User.findOne({
        email: normalizedEmail,
      });
    }

    if (!user) {
      return res.status(404).json({
        message:
          "No CultureBridge account found. Please register first.",
      });
    }

    if (user.status === "Inactive") {
      return res.status(403).json({
        message:
          "Your account is inactive. Contact your administrator.",
      });
    }

    // Do not overwrite a different Google identity.
    if (user.googleId && user.googleId !== googleId) {
      return res.status(409).json({
        message:
          "This account is already linked to another Google account.",
      });
    }

    // Link an existing password account to the verified Google identity.
    if (!user.googleId) {
      user.googleId = googleId;
      await user.save();
    }

    // Preserve the user's existing account role.
    return res.status(200).json(authResponse(user));
  } catch (error) {
    console.error("Google authentication error:", error);

    if (error && error.code === 11000) {
      return res.status(409).json({
        message: "This Google account or email is already registered.",
      });
    }

    return res.status(500).json({
      message: "Google authentication failed. Please try again.",
    });
  }
});

// =====================================
// EXPORT ROUTER
// =====================================

module.exports = router;