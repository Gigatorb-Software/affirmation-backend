const express = require("express");
const router = express.Router();
const goalController = require("../controllers/goal.controller");
const { authenticate } = require("../middleware/auth");

// Apply authentication middleware to all routes
router.use(authenticate);

// Goal routes
router.post("/", goalController.createGoal);
router.get("/", goalController.getUserGoals);
router.get("/:id", goalController.getGoalById);
router.put("/:id", goalController.updateGoal);
router.delete("/:id", goalController.deleteGoal);

// Milestone routes
router.post("/:goalId/milestones", goalController.addMilestone);
router.get("/:goalId/milestones", goalController.getGoalMilestones);
router.put("/milestones/:id", goalController.updateMilestone);
router.delete("/milestones/:id", goalController.deleteMilestone);

module.exports = router;
