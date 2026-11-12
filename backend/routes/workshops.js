const router = require("express").Router();
const Workshop = require("../models/Workshop");
const { protect } = require("../middleware/auth");

router.get("/", protect(), async (req, res) => res.json(await Workshop.find().sort("-createdAt")));
router.post("/", protect("admin", "facilitator"), async (req, res) => res.status(201).json(await Workshop.create(req.body)));
router.delete("/:id", protect("admin"), async (req, res) => { await Workshop.findByIdAndDelete(req.params.id); res.json({ ok: true }); });

module.exports = router;