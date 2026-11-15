const router = require("express").Router();
const mongoose = require("mongoose");

const Workshop = require("../models/Workshop");
const User = require("../models/User");
const { protect } = require("../middleware/auth");

const isId = (id) => mongoose.isValidObjectId(id);

const getRole = (req) => String(req.user?.role || "").trim().toLowerCase();
const getUserId = (req) => String(req.user?.id || req.user?._id || "");
const isFacilitator = (req) => getRole(req) === "facilitator";

async function findAccessible(id, req) {
  if (!isId(id)) {
    return { error: "Invalid programme ID", status: 400 };
  }

  const workshop = await Workshop.findById(id);

  if (!workshop) {
    return { error: "Programme not found", status: 404 };
  }

  if (
    isFacilitator(req) &&
    (!workshop.trainer || String(workshop.trainer) !== getUserId(req))
  ) {
    return {
      error: "You can only manage programmes assigned to you",
      status: 403,
    };
  }

  return { workshop };
}

// GET ALL WORKSHOPS
// Admin: all programmes. Facilitator: assigned programmes. Learner: published programmes.
router.get("/", protect(), async (req, res) => {
  try {
    const role = getRole(req);
    const filter =
      role === "facilitator"
        ? { trainer: getUserId(req) }
        : role === "learner"
          ? { status: "Published" }
          : {};

    const workshops = await Workshop.find(filter)
      .populate("trainer", "name email")
      .populate("organisation", "name industry")
      .populate("enrolledUsers", "name email role")
      .populate("attendance", "name email")
      .sort("-createdAt");

    const result = workshops.map((workshop) => {
      const data = workshop.toObject();
      const enrolledUsers = data.enrolledUsers || [];

      return {
        ...data,
        registered: enrolledUsers.length,
        enrolledByMe: enrolledUsers.some(
          (user) => String(user?._id || user) === getUserId(req)
        ),
      };
    });

    res.json(result);
  } catch (error) {
    console.error("Get workshops error:", error);
    res.status(500).json({ message: error.message || "Unable to load programmes" });
  }
});

// GET ONE WORKSHOP
router.get("/:id", protect(), async (req, res) => {
  try {
    if (!isId(req.params.id)) {
      return res.status(400).json({ message: "Invalid programme ID" });
    }

    const workshop = await Workshop.findById(req.params.id)
      .populate("trainer", "name email")
      .populate("organisation", "name industry")
      .populate("enrolledUsers", "name email role")
      .populate("attendance", "name email");

    if (!workshop) {
      return res.status(404).json({ message: "Programme not found" });
    }

    const role = getRole(req);

    if (
      role === "facilitator" &&
      (!workshop.trainer || String(workshop.trainer._id) !== getUserId(req))
    ) {
      return res.status(403).json({ message: "You cannot access this programme" });
    }

    if (role === "learner" && workshop.status !== "Published") {
      return res.status(404).json({ message: "Programme not found" });
    }

    res.json(workshop);
  } catch (error) {
    console.error("Get workshop error:", error);
    res.status(500).json({ message: error.message || "Unable to load programme" });
  }
});

// CREATE WORKSHOP
router.post("/", protect("admin", "facilitator"), async (req, res) => {
  try {
    const {
      title,
      description,
      cat,
      date,
      capacity,
      facilitator,
      trainer,
      organisation,
      modules,
      status,
    } = req.body;

    if (!title || !date) {
      return res.status(400).json({ message: "Programme title and date are required" });
    }

    const role = getRole(req);
    let assignedTrainer = null;
    let assignedFacilitator = facilitator || "";

    if (role === "facilitator") {
      assignedTrainer = getUserId(req);
    } else if (trainer) {
      if (!isId(trainer)) {
        return res.status(400).json({ message: "Invalid trainer ID" });
      }

      const selectedTrainer = await User.findById(trainer).select("name role status");
      if (!selectedTrainer) {
        return res.status(404).json({ message: "Trainer account not found" });
      }
      if (String(selectedTrainer.role || "").trim().toLowerCase() !== "facilitator") {
        return res.status(400).json({ message: "Selected account is not a facilitator" });
      }
      if (String(selectedTrainer.status || "").trim().toLowerCase() !== "active") {
        return res.status(400).json({ message: "Selected facilitator account is inactive" });
      }

      assignedTrainer = selectedTrainer._id;
      assignedFacilitator = selectedTrainer.name;
    }

    const workshop = await Workshop.create({
      title: String(title).trim(),
      description: description || "",
      cat: cat || "General",
      date,
      capacity: Number(capacity) || 25,
      facilitator: assignedFacilitator,
      trainer: assignedTrainer,
      organisation: organisation || null,
      modules: Array.isArray(modules) ? modules : [],
      status: status === "Published" && role === "admin" ? "Published" : "Draft",
    });

    const response = await Workshop.findById(workshop._id)
      .populate("trainer", "name email")
      .populate("organisation", "name industry");

    res.status(201).json(response);
  } catch (error) {
    console.error("Create workshop error:", error);
    res.status(400).json({ message: error.message || "Unable to create programme" });
  }
});

// LEARNER ENROLLMENT
router.post("/:id/enroll", protect("learner"), async (req, res) => {
  try {
    if (!isId(req.params.id)) {
      return res.status(400).json({ message: "Invalid programme ID" });
    }

    const workshop = await Workshop.findById(req.params.id);
    if (!workshop) {
      return res.status(404).json({ message: "Programme not found" });
    }
    if (workshop.status !== "Published") {
      return res.status(400).json({ message: "Programme is not published" });
    }

    const userId = getUserId(req);
    if ((workshop.enrolledUsers || []).some((id) => String(id) === userId)) {
      return res.status(400).json({ message: "Already enrolled" });
    }
    if (workshop.capacity > 0 && workshop.enrolledUsers.length >= workshop.capacity) {
      return res.status(400).json({ message: "Programme is full" });
    }

    workshop.enrolledUsers.push(userId);
    workshop.registered = workshop.enrolledUsers.length;
    await workshop.save();

    res.json({
      message: "Successfully enrolled",
      registered: workshop.registered,
      enrolledByMe: true,
    });
  } catch (error) {
    console.error("Workshop enrollment error:", error);
    res.status(500).json({ message: error.message || "Unable to enroll" });
  }
});

// LEARNER UNENROLLMENT
router.delete("/:id/enroll", protect("learner"), async (req, res) => {
  try {
    if (!isId(req.params.id)) {
      return res.status(400).json({ message: "Invalid programme ID" });
    }

    const workshop = await Workshop.findById(req.params.id);
    if (!workshop) {
      return res.status(404).json({ message: "Programme not found" });
    }

    const userId = getUserId(req);
    workshop.enrolledUsers = (workshop.enrolledUsers || []).filter(
      (id) => String(id) !== userId
    );
    workshop.attendance = (workshop.attendance || []).filter(
      (id) => String(id) !== userId
    );
    workshop.registered = workshop.enrolledUsers.length;
    await workshop.save();

    res.json({
      message: "Successfully unenrolled",
      registered: workshop.registered,
      enrolledByMe: false,
    });
  } catch (error) {
    console.error("Workshop unenrollment error:", error);
    res.status(500).json({ message: error.message || "Unable to unenroll" });
  }
});

// SAVE ATTENDANCE. The request contains IDs of enrolled learners marked present.
router.patch("/:id/attendance", protect("admin", "facilitator"), async (req, res) => {
  try {
    const found = await findAccessible(req.params.id, req);
    if (found.error) {
      return res.status(found.status).json({ message: found.error });
    }

    const { attendance } = req.body;
    if (!Array.isArray(attendance) || attendance.some((id) => !isId(id))) {
      return res.status(400).json({
        message: "Attendance must be an array of valid learner IDs",
      });
    }

    const enrolled = new Set((found.workshop.enrolledUsers || []).map(String));
    const uniquePresent = [...new Set(attendance.map(String))];

    if (uniquePresent.some((id) => !enrolled.has(id))) {
      return res.status(400).json({
        message: "Attendance can only be marked for enrolled learners",
      });
    }

    found.workshop.attendance = uniquePresent;
    await found.workshop.save();
    await found.workshop.populate("attendance", "name email");

    res.json({
      message: "Attendance saved",
      attendance: found.workshop.attendance,
    });
  } catch (error) {
    console.error("Save attendance error:", error);
    res.status(500).json({ message: error.message || "Unable to save attendance" });
  }
});

// UPDATE WORKSHOP AND ASSIGN TRAINER
router.patch("/:id", protect("admin", "facilitator"), async (req, res) => {
  try {
    const found = await findAccessible(req.params.id, req);
    if (found.error) {
      return res.status(found.status).json({ message: found.error });
    }

    const role = getRole(req);
    const workshop = found.workshop;

    const allowed = [
      "title",
      "description",
      "cat",
      "date",
      "capacity",
      "organisation",
      "modules",
      "status",
      "completed",
    ];

    // Apply ordinary editable fields. Trainer/facilitator are handled separately below.
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        if (role === "facilitator" && key === "status") continue;
        workshop.set(key, req.body[key]);
      }
    }

    // Only Admin can assign or change a trainer.
    if (role === "admin" && Object.prototype.hasOwnProperty.call(req.body, "trainer")) {
      const rawTrainerId = req.body.trainer;
      const trainerId = rawTrainerId == null ? "" : String(rawTrainerId).trim();

      console.log("[PATCH /workshops/:id] trainer assignment request", {
        workshopId: String(workshop._id),
        trainerId: trainerId || null,
      });

      if (!trainerId) {
        workshop.trainer = null;
        workshop.facilitator = "";
      } else {
        if (!isId(trainerId)) {
          return res.status(400).json({ message: "Invalid trainer ID received by server" });
        }

        // Look up by ID first, then validate role/status separately. This makes
        // failures distinguishable and avoids hiding a bad ID behind a compound query.
        const selectedTrainer = await User.findById(trainerId).select("_id name email role status");

        if (!selectedTrainer) {
          console.error("Trainer assignment failed: no User record for ID", trainerId);
          return res.status(404).json({
            message: `No user account found for trainer ID ${trainerId}`,
          });
        }

        const trainerRole = String(selectedTrainer.role || "").trim().toLowerCase();
        const trainerStatus = String(selectedTrainer.status || "").trim().toLowerCase();

        if (trainerRole !== "facilitator") {
          return res.status(400).json({
            message: `Selected account (${selectedTrainer.email}) has role '${selectedTrainer.role}', not 'facilitator'`,
          });
        }

        if (trainerStatus !== "active") {
          return res.status(400).json({
            message: `Selected facilitator account (${selectedTrainer.email}) is '${selectedTrainer.status || "missing status"}', not Active`,
          });
        }

        workshop.trainer = selectedTrainer._id;
        workshop.facilitator = selectedTrainer.name;
      }
    }

    // Facilitators cannot change trainer assignments or publish programmes.
    if (role === "facilitator") {
      if (req.body.status !== undefined) {
        // status is intentionally ignored for facilitator updates.
      }
      if (req.body.trainer !== undefined || req.body.facilitator !== undefined) {
        // Do not let a facilitator change their own or another trainer assignment.
      }
    }

    await workshop.save();

    const savedWorkshop = await Workshop.findById(workshop._id)
      .populate("trainer", "name email")
      .populate("organisation", "name industry")
      .populate("enrolledUsers", "name email role")
      .populate("attendance", "name email");

    console.log("[PATCH /workshops/:id] trainer assignment saved", {
      workshopId: String(savedWorkshop?._id),
      trainerId: savedWorkshop?.trainer?._id
        ? String(savedWorkshop.trainer._id)
        : savedWorkshop?.trainer
          ? String(savedWorkshop.trainer)
          : null,
      facilitator: savedWorkshop?.facilitator || "",
    });

    if (!savedWorkshop) {
      return res.status(404).json({ message: "Programme not found after update" });
    }

    res.json(savedWorkshop);
  } catch (error) {
    console.error("Update workshop error:", error);
    res.status(400).json({ message: error.message || "Unable to update programme" });
  }
});

// DELETE WORKSHOP - ADMIN ONLY
router.delete("/:id", protect("admin"), async (req, res) => {
  try {
    if (!isId(req.params.id)) {
      return res.status(400).json({ message: "Invalid programme ID" });
    }

    const workshop = await Workshop.findByIdAndDelete(req.params.id);
    if (!workshop) {
      return res.status(404).json({ message: "Programme not found" });
    }

    res.json({ message: "Programme deleted" });
  } catch (error) {
    console.error("Delete workshop error:", error);
    res.status(500).json({ message: error.message || "Unable to delete programme" });
  }
});

module.exports = router;
