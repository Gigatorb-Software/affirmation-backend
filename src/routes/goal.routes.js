const express = require("express");
const router = express.Router();
const goalController = require("../controllers/goal.controller");
const { authenticate } = require("../middleware/auth");

/**
 * @swagger
 * tags:
 *   name: Goals
 *   description: API for managing user goals
 */

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * @swagger
 * /goals:
 *   post:
 *     summary: Create a new goal
 *     tags: [Goals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               targetDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Goal created successfully
 */
router.post("/", goalController.createGoal);

/**
 * @swagger
 * /goals:
 *   get:
 *     summary: Get all goals for the current user
 *     tags: [Goals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of goals
 */
router.get("/", goalController.getUserGoals);

/**
 * @swagger
 * /goals/{id}:
 *   get:
 *     summary: Get a goal by ID
 *     tags: [Goals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Goal data
 */
router.get("/:id", goalController.getGoalById);

/**
 * @swagger
 * /goals/{id}:
 *   put:
 *     summary: Update a goal
 *     tags: [Goals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               targetDate:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, COMPLETED, ON_HOLD, CANCELLED]
 *               progress:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Goal updated successfully
 */
router.put("/:id", goalController.updateGoal);

/**
 * @swagger
 * /goals/{id}:
 *   delete:
 *     summary: Delete a goal
 *     tags: [Goals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Goal deleted successfully
 */
router.delete("/:id", goalController.deleteGoal);

// Milestone routes
router.post("/:goalId/milestones", goalController.addMilestone);
router.get("/:goalId/milestones", goalController.getGoalMilestones);
router.put("/milestones/:id", goalController.updateMilestone);
router.delete("/milestones/:id", goalController.deleteMilestone);

module.exports = router;
