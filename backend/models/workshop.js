const mongoose = require("mongoose");

module.exports = mongoose.model(
  "Workshop",
  new mongoose.Schema(
    {
      title: { type: String, required: true },
      cat: String,
      date: String,
      capacity: Number,
      facilitator: String,
      status: { type: String, default: "Published" },
      registered: { type: Number, default: 0 },
    },
    { timestamps: true }
  )
);