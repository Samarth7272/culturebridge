const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // User's full name
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Email address must be unique
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // Local accounts use their normal bcrypt password.
    // Google accounts receive a random, securely hashed password.
    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    // Google's stable account identifier (sub claim).
    // Existing password-only accounts can leave this field empty.
    googleId: {
      type: String,
      default: undefined,
      trim: true,
    },

    // User role
    role: {
      type: String,
      enum: ["learner", "facilitator", "admin"],
      default: "learner",
    },

    // Organisation associated with the user
    organisation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organisation",
      default: null,
    },

    // Account status
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

// A Google account can be linked to only one CultureBridge user.
// Sparse allows existing password-only accounts to have no googleId.
userSchema.index(
  { googleId: 1 },
  { unique: true, sparse: true }
);

module.exports = mongoose.model("User", userSchema);