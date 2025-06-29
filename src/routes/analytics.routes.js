const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analytics.controller");
const { authenticate } = require("../middleware/auth");

/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: API for dashboard analytics and statistics
 */

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /analytics/dashboard:
 *   get:
 *     summary: Get comprehensive dashboard analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard analytics data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/dashboard", analyticsController.getDashboardAnalytics);

/**
 * @swagger
 * /analytics/affirmations:
 *   get:
 *     summary: Get affirmation analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Affirmation analytics data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/affirmations", analyticsController.getAffirmationAnalytics);

/**
 * @swagger
 * /analytics/posts:
 *   get:
 *     summary: Get post analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Post analytics data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/posts", analyticsController.getPostAnalytics);

/**
 * @swagger
 * /analytics/user-growth:
 *   get:
 *     summary: Get user growth analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User growth analytics data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/user-growth", analyticsController.getUserGrowthAnalytics);

/**
 * @swagger
 * /analytics/popular-affirmations:
 *   get:
 *     summary: Get popular affirmations
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Popular affirmations data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/popular-affirmations", analyticsController.getPopularAffirmations);

/**
 * @swagger
 * /analytics/affirmation-completion-rate:
 *   get:
 *     summary: Get affirmation completion rate
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Affirmation completion rate data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
  "/affirmation-completion-rate",
  analyticsController.getAffirmationCompletionRate
);

module.exports = router;
