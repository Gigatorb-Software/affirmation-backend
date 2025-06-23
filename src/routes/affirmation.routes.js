const express = require("express");
const router = express.Router();
const affirmationController = require("../controllers/affirmation.controller");
const { authenticate } = require("../middleware/auth");

/**
 * @swagger
 * tags:
 *   name: Affirmations
 *   description: API for managing affirmations and user history
 */

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * @swagger
 * /affirmations:
 *   post:
 *     summary: Create a new affirmation
 *     tags: [Affirmations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *               audioUrl:
 *                 type: string
 *               categoryId:
 *                 type: string
 *               isPremium:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Affirmation created successfully
 */
router.post("/", affirmationController.createAffirmation);

/**
 * @swagger
 * /affirmations:
 *   get:
 *     summary: Get all affirmations
 *     tags: [Affirmations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of affirmations
 */
router.get("/", affirmationController.getAllAffirmations);

/**
 * @swagger
 * /affirmations/{id}:
 *   get:
 *     summary: Get an affirmation by ID
 *     tags: [Affirmations]
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
 *         description: Affirmation data
 */
router.get("/:id", affirmationController.getAffirmationById);

/**
 * @swagger
 * /affirmations/{id}:
 *   put:
 *     summary: Update an affirmation
 *     tags: [Affirmations]
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
 *               content:
 *                 type: string
 *               audioUrl:
 *                 type: string
 *               categoryId:
 *                 type: string
 *               isPremium:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Affirmation updated successfully
 */
router.put("/:id", affirmationController.updateAffirmation);

/**
 * @swagger
 * /affirmations/{id}:
 *   delete:
 *     summary: Delete an affirmation
 *     tags: [Affirmations]
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
 *         description: Affirmation deleted successfully
 */
router.delete("/:id", affirmationController.deleteAffirmation);

/**
 * @swagger
 * /affirmations/category/{categoryId}:
 *   get:
 *     summary: Get affirmations by category
 *     tags: [Affirmations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of affirmations in the specified category
 */
router.get(
  "/category/:categoryId",
  affirmationController.getAffirmationsByCategory
);

/**
 * @swagger
 * /affirmations/{affirmationId}/history:
 *   post:
 *     summary: Record an affirmation in the user's history
 *     tags: [Affirmations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: affirmationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Affirmation history recorded successfully
 */
router.post(
  "/:affirmationId/history",
  affirmationController.recordAffirmationHistory
);

/**
 * @swagger
 * /affirmations/history:
 *   get:
 *     summary: Get the current user's affirmation history
 *     tags: [Affirmations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of the user's affirmation history
 */
router.get("/history", affirmationController.getUserAffirmationHistory);

/**
 * @swagger
 * /affirmations/history/{historyId}/complete:
 *   put:
 *     summary: Mark an affirmation as completed in the user's history
 *     tags: [Affirmations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: historyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Affirmation marked as completed
 */
router.put(
  "/history/:historyId/complete",
  affirmationController.markAffirmationCompleted
);

/**
 * @swagger
 * /affirmations/test/send-notification:
 *   post:
 *     summary: Test sending an affirmation notification
 *     tags: [Affirmations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Test notification sent successfully
 */
router.post("/test/send-notification", (req, res) =>
  affirmationController.testSendAffirmationNotification(req, res)
);

module.exports = router;
