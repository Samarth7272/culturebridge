const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  content: { type: String, default: "" },
  videoUrl: { type: String, default: "" },
  duration: { type: Number, default: 0, min: 0 },
}, { _id: true });

const moduleSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  content: { type: String, default: "" },
  order: { type: Number, default: 1 },
  duration: { type: Number, default: 0, min: 0 },
  lessons: { type: [lessonSchema], default: [] },
}, { _id: true });

const workshopSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  cat: { type: String, default: "General" },
  date: { type: String, default: "" },
  capacity: { type: Number, default: 25, min: 1 },
  facilitator: { type: String, default: "" },
  trainer: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  organisation: { type: mongoose.Schema.Types.ObjectId, ref: "Organisation", default: null },
  modules: { type: [moduleSchema], default: [] },
  status: { type: String, enum: ["Draft", "Published"], default: "Draft" },
  registered: { type: Number, default: 0 },
  completed: { type: Number, default: 0 },
  enrolledUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  attendance: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });

module.exports = mongoose.model("Workshop", workshopSchema);
