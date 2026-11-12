const mongoose = require("mongoose");

const workshopSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    cat: String,
    date: String,
    capacity: {
      type: Number,
      default: 25,
    },
    facilitator: String,
    status: {
      type: String,
      enum: ["Draft", "Published"],
      default: "Draft",
    },
    registered: {
      type: Number,
      default: 0,
    },
    completed: {
      type: Number,
      default: 0,
    },
    enrolledUsers: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Workshop", workshopSchema);