const router = require("express").Router();
const mongoose = require("mongoose");

const LearnerProgress = require("../models/LearnerProgress");
const Workshop = require("../models/Workshop");
const { protect } = require("../middleware/auth");
const { QUIZ, SCENARIOS } = require("../data/assessments");

const isId = (id) => mongoose.isValidObjectId(id);
const userId = (req) => String(req.user?.id || req.user?._id || "");

async function getEnrolledWorkshop(workshopId, learnerId) {
  if (!isId(workshopId)) return null;

  return Workshop.findOne({
    _id: workshopId,
    status: "Published",
    enrolledUsers: learnerId,
  });
}

function getLessonIds(workshop) {
  return (workshop.modules || []).flatMap((module) =>
    (module.lessons || []).map((lesson) => String(lesson._id))
  );
}

async function getOrCreateProgress(learnerId, workshopId) {
  return LearnerProgress.findOneAndUpdate(
    { learner: learnerId, workshop: workshopId },
    {
      $setOnInsert: {
        learner: learnerId,
        workshop: workshopId,
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
}

// GET MY PROGRESS
router.get("/my", protect("learner"), async (req, res) => {
  try {
    const records = await LearnerProgress.find({
      learner: userId(req),
    }).populate("workshop", "title status modules");

    res.json(records);
  } catch (error) {
    console.error("Get learner progress error:", error);
    res.status(500).json({ message: "Unable to load learning progress" });
  }
});

// GET PROGRESS FOR ONE PROGRAMME
router.get("/:workshopId", protect("learner"), async (req, res) => {
  try {
    const workshop = await getEnrolledWorkshop(
      req.params.workshopId,
      userId(req)
    );

    if (!workshop) {
      return res.status(404).json({
        message: "Published enrolled programme not found",
      });
    }

    const progress = await getOrCreateProgress(
      userId(req),
      workshop._id
    );

    res.json(progress);
  } catch (error) {
    console.error("Get programme progress error:", error);
    res.status(500).json({ message: "Unable to load programme progress" });
  }
});

// MARK LESSON COMPLETED
router.patch(
  "/:workshopId/lessons/:lessonId",
  protect("learner"),
  async (req, res) => {
    try {
      const workshop = await getEnrolledWorkshop(
        req.params.workshopId,
        userId(req)
      );

      if (!workshop) {
        return res.status(404).json({
          message: "Enrolled programme not found",
        });
      }

      const lessonId = req.params.lessonId;

      if (!isId(lessonId)) {
        return res.status(400).json({ message: "Invalid lesson ID" });
      }

      const validLessonIds = getLessonIds(workshop);

      if (!validLessonIds.includes(lessonId)) {
        return res.status(404).json({
          message: "Lesson not found in this programme",
        });
      }

      const progress = await getOrCreateProgress(
        userId(req),
        workshop._id
      );

      if (!progress.completedLessons.some((id) => String(id) === lessonId)) {
        progress.completedLessons.push(lessonId);
      }

      progress.currentLesson = lessonId;

      progress.progressPercentage = validLessonIds.length
        ? Math.round(
            (progress.completedLessons.length / validLessonIds.length) * 100
          )
        : 0;

      if (
        validLessonIds.length > 0 &&
        progress.completedLessons.length >= validLessonIds.length
      ) {
        progress.completedAt = progress.completedAt || new Date();
      }

      await progress.save();
      res.json(progress);
    } catch (error) {
      console.error("Save lesson progress error:", error);
      res.status(500).json({
        message: "Unable to save lesson progress",
      });
    }
  }
);

// SECURE QUIZ GRADING
// The browser submits answers, never the score.
router.post(
  "/:workshopId/quizzes",
  protect("learner"),
  async (req, res) => {
    try {
      const workshop = await getEnrolledWorkshop(
        req.params.workshopId,
        userId(req)
      );

      if (!workshop) {
        return res.status(404).json({
          message: "Enrolled programme not found",
        });
      }

      const { quizType, answers } = req.body;

      if (!["pre", "post"].includes(quizType)) {
        return res.status(400).json({ message: "Invalid quiz type" });
      }

      if (
        !Array.isArray(answers) ||
        answers.length !== QUIZ.length ||
        answers.some(
          (answer) =>
            !Number.isInteger(answer) ||
            answer < 0 ||
            answer >= QUIZ[0].opts.length
        )
      ) {
        return res.status(400).json({
          message: "Please submit one valid answer for every question",
        });
      }

      const score = QUIZ.reduce(
        (total, question, index) =>
          total + (answers[index] === question.a ? 1 : 0),
        0
      );

      const progress = await getOrCreateProgress(
        userId(req),
        workshop._id
      );

      progress.quizResults.push({
        quizType,
        score,
        total: QUIZ.length,
        answers,
        completedAt: new Date(),
      });

      await progress.save();

      res.json({
        message: "Quiz graded and saved successfully",
        result: {
          quizType,
          score,
          total: QUIZ.length,
          answers,
          completedAt: new Date(),
        },
        progress,
      });
    } catch (error) {
      console.error("Save quiz result error:", error);
      res.status(500).json({
        message: "Unable to save quiz result",
      });
    }
  }
);

// SAVE ONE WORKPLACE SCENARIO RESPONSE
router.post(
  "/:workshopId/scenarios",
  protect("learner"),
  async (req, res) => {
    try {
      const workshop = await getEnrolledWorkshop(
        req.params.workshopId,
        userId(req)
      );

      if (!workshop) {
        return res.status(404).json({
          message: "Enrolled programme not found",
        });
      }

      const { scenarioId, selectedOption } = req.body;

      const scenario = SCENARIOS.find(
        (item) => item.id === scenarioId
      );

      if (!scenario) {
        return res.status(400).json({
          message: "Invalid scenario ID",
        });
      }

      if (
        !Number.isInteger(selectedOption) ||
        selectedOption < 0 ||
        selectedOption > 2
      ) {
        return res.status(400).json({
          message: "Invalid scenario option",
        });
      }

      const correct = selectedOption === scenario.correctOption;

      const progress = await getOrCreateProgress(
        userId(req),
        workshop._id
      );

      const existing = progress.scenarioResults.find(
        (item) => item.scenarioId === scenarioId
      );

      if (existing) {
        existing.selectedOption = selectedOption;
        existing.correct = correct;
        existing.completedAt = new Date();
      } else {
        progress.scenarioResults.push({
          scenarioId,
          selectedOption,
          correct,
          completedAt: new Date(),
        });
      }

      await progress.save();

      res.json({
        message: "Scenario response saved successfully",
        result: {
          scenarioId,
          selectedOption,
          correct,
        },
        progress,
      });
    } catch (error) {
      console.error("Save scenario result error:", error);
      res.status(500).json({
        message: "Unable to save scenario result",
      });
    }
  }
);
// =============================================
// ADMIN-ONLY ASSESSMENT & LEARNER REPORTS
// =============================================

router.get("/admin/reports", protect("admin"), async (req, res) => {
  try {
    const [workshops, records] = await Promise.all([
      Workshop.find({})
        .select("title status enrolledUsers")
        .lean(),

      LearnerProgress.find({})
        .populate("learner", "name email role")
        .populate("workshop", "title status")
        .lean(),
    ]);

    const latestQuiz = (progress, quizType) => {
      return (progress.quizResults || [])
        .filter((item) => item.quizType === quizType)
        .sort(
          (a, b) =>
            new Date(b.completedAt || 0).getTime() -
            new Date(a.completedAt || 0).getTime()
        )[0] || null;
    };

    const quizPercentage = (result) => {
      if (!result || !result.total) return null;

      return Math.round((result.score / result.total) * 100);
    };

    const average = (values) => {
      const valid = values.filter(
        (value) => typeof value === "number" && Number.isFinite(value)
      );

      if (!valid.length) return null;

      return Math.round(
        valid.reduce((sum, value) => sum + value, 0) / valid.length
      );
    };

    const learnerRows = records.map((progress) => {
      const pre = latestQuiz(progress, "pre");
      const post = latestQuiz(progress, "post");

      const scenarios = progress.scenarioResults || [];
      const completedScenarioIds = new Set(
        scenarios.map((item) => item.scenarioId)
      );

      const completedScenarioCount = completedScenarioIds.size;

      // Matches the current learner certificate-readiness rule:
      // all five scenarios plus both quizzes completed.
      const certificateEligible =
        completedScenarioCount >= SCENARIOS.length &&
        !!pre &&
        !!post;

      return {
        learnerId: String(
          progress.learner?._id || progress.learner || ""
        ),
        learnerName: progress.learner?.name || "Unknown learner",
        learnerEmail: progress.learner?.email || "",
        programmeId: String(
          progress.workshop?._id || progress.workshop || ""
        ),
        programmeName: progress.workshop?.title || "Deleted programme",

        progressPercentage: Number(progress.progressPercentage) || 0,

        preQuiz: pre
          ? {
              score: pre.score,
              total: pre.total,
              percentage: quizPercentage(pre),
              completedAt: pre.completedAt,
            }
          : null,

        postQuiz: post
          ? {
              score: post.score,
              total: post.total,
              percentage: quizPercentage(post),
              completedAt: post.completedAt,
            }
          : null,

        quizAttempts: (progress.quizResults || []).length,

        scenariosCompleted: completedScenarioCount,
        scenariosTotal: SCENARIOS.length,
        scenariosCorrect: scenarios.filter(
          (item) => item.correct
        ).length,

        certificateEligible,
      };
    });

    const preScores = learnerRows
      .map((item) => item.preQuiz?.percentage ?? null);

    const postScores = learnerRows
      .map((item) => item.postQuiz?.percentage ?? null);

    const allScenarioResults = records.flatMap(
      (item) => item.scenarioResults || []
    );

    const scenarioCorrectCount = allScenarioResults.filter(
      (item) => item.correct
    ).length;

    const totalQuizAttempts = records.reduce(
      (sum, item) => sum + (item.quizResults || []).length,
      0
    );

    const programmes = workshops.map((workshop) => {
      const programmeId = String(workshop._id);

      const programmeLearners = learnerRows.filter(
        (item) => item.programmeId === programmeId
      );

      const programmeRecords = records.filter(
        (item) =>
          String(item.workshop?._id || item.workshop || "") ===
          programmeId
      );

      const programmeScenarios = programmeRecords.flatMap(
        (item) => item.scenarioResults || []
      );

      const prePercentages = programmeLearners.map(
        (item) => item.preQuiz?.percentage ?? null
      );

      const postPercentages = programmeLearners.map(
        (item) => item.postQuiz?.percentage ?? null
      );

      const scenarioCompleted = programmeLearners.reduce(
        (sum, item) => sum + item.scenariosCompleted,
        0
      );

      const scenarioPossible =
        programmeLearners.length * SCENARIOS.length;

      return {
        programmeId,
        programmeName: workshop.title,
        status: workshop.status,

        enrolledCount: (workshop.enrolledUsers || []).length,
        learnersStarted: programmeLearners.length,

        preQuizAverage: average(prePercentages),
        postQuizAverage: average(postPercentages),

        scenarioAttempts: programmeScenarios.length,
        scenarioAccuracy: programmeScenarios.length
          ? Math.round(
              (programmeScenarios.filter((item) => item.correct).length /
                programmeScenarios.length) * 100
            )
          : null,

        scenarioCompletionRate: scenarioPossible
          ? Math.round(
              (scenarioCompleted / scenarioPossible) * 100
            )
          : null,

        certificateEligibleCount: programmeLearners.filter(
          (item) => item.certificateEligible
        ).length,
      };
    });

    const uniqueLearners = new Set(
      learnerRows.map((item) => item.learnerId).filter(Boolean)
    );

    res.json({
      summary: {
        totalProgrammes: workshops.length,

        totalEnrolments: workshops.reduce(
          (sum, item) => sum + (item.enrolledUsers || []).length,
          0
        ),

        learnersWithProgress: uniqueLearners.size,

        totalQuizAttempts,

        preQuizAverage: average(preScores),
        postQuizAverage: average(postScores),

        totalScenarioResponses: allScenarioResults.length,

        scenarioAccuracy: allScenarioResults.length
          ? Math.round(
              (scenarioCorrectCount / allScenarioResults.length) * 100
            )
          : null,

        certificateEligibleCount: learnerRows.filter(
          (item) => item.certificateEligible
        ).length,
      },

      programmes,
      learners: learnerRows,

      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Admin assessment reports error:", error);

    res.status(500).json({
      message: "Unable to generate admin assessment reports",
    });
  }
});
module.exports = router;