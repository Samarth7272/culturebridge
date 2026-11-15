const router = require("express").Router();
const OpenAI = require("openai");
const { protect } = require("../middleware/auth");


const requestLimits = new Map();

router.post("/chat", protect("learner"), async (req, res) => {
  try {
    const learnerId = String(req.user?.id || req.user?._id || "");

    if (!learnerId) {
      return res.status(401).json({ message: "Please log in again." });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({
        message: "AI service is not configured.",
      });
    }
    const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

    // Basic per-learner request limit: 10 messages per minute.
    const now = Date.now();
    const previous = requestLimits.get(learnerId);

    if (previous && now - previous.startedAt < 60000 &&
        previous.count >= 10) {
      return res.status(429).json({
        message: "Message limit reached. Please try again in one minute.",
      });
    }

    if (!previous || now - previous.startedAt >= 60000) {
      requestLimits.set(learnerId, { startedAt: now, count: 1 });
    } else {
      previous.count += 1;
    }

    const messages = req.body?.messages;

    if (!Array.isArray(messages) || messages.length === 0 ||
        messages.length > 8) {
      return res.status(400).json({
        message: "Please send a valid conversation.",
      });
    }

    const input = [];

    for (const message of messages) {
      if (
        !["user", "assistant"].includes(message?.role) ||
        typeof message.content !== "string" ||
        !message.content.trim() ||
        message.content.length > 1500
      ) {
        return res.status(400).json({
          message: "Invalid or oversized message.",
        });
      }

      input.push({
        role: message.role,
        content: message.content.trim(),
      });
    }

    if (input[input.length - 1].role !== "user") {
      return res.status(400).json({
        message: "Please send a learner message.",
      });
    }

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-6-luna",

      instructions: `
You are CultureBridge AI Learning Coach.

You support engineers, technology professionals,
managers and learners.

Help users with:
- Programming and engineering concepts.
- Technical problem solving.
- Cross-cultural communication.
- International workplace collaboration.
- Leadership and professional development.
- Interview and meeting preparation.

Use simple explanations when needed.
Give practical examples and clear steps.
Adapt to the learner's experience level.
Encourage respectful and inclusive teamwork.

Never invent course records, grades or certificates.
Do not claim access to private learner data.
Keep answers focused and educational.
      `,

      input,
      max_output_tokens: 500,
      store: false,
    });

    const reply = response.output_text?.trim();

    if (!reply) {
      return res.status(502).json({
        message: "The AI returned an empty response.",
      });
    }

    return res.json({ reply });

  } catch (error) {
    console.error("CultureBridge AI error:", error.message);

    return res.status(502).json({
      message: "The AI assistant is temporarily unavailable.",
    });
  }
});

module.exports = router;