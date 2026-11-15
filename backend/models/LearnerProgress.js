const mongoose = require("mongoose");

const quizResultSchema = new mongoose.Schema(
  {
    quizType: {
      type: String,
      enum: ["pre", "post"],
      required: true,
    },
    score: {
      type: Number,
      min: 0,
      required: true,
    },
    total: {
      type: Number,
      min: 0,
      required: true,
    },
    answers: {
      type: [Number],
      default: [],
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const scenarioResultSchema = new mongoose.Schema(
  {
    scenarioId: {
      type: String,
      required: true,
    },
    selectedOption: {
      type: Number,
      required: true,
      min: 0,
    },
    correct: {
      type: Boolean,
      required: true,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const learnerProgressSchema = new mongoose.Schema(
  {
    learner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    workshop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workshop",
      required: true,
    },

    completedLessons: {
      type: [{ type: mongoose.Schema.Types.ObjectId }],
      default: [],
    },

    currentLesson: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    progressPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    quizResults: {
      type: [quizResultSchema],
      default: [],
    },

    scenarioResults: {
      type: [scenarioResultSchema],
      default: [],
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

learnerProgressSchema.index(
  { learner: 1, workshop: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "LearnerProgress",
  learnerProgressSchema
);