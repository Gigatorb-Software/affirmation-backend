const express = require("express");
const router = express.Router();
const userCategoryPreferenceController = require("../controllers/userCategoryPreference.controller");

const { authenticate } = require("../middleware/auth");


/**
 * @swagger
 * tags:
 *   name: UserCategoryPreferences
 *   description: User Category Preferences management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CategoryPreferenceUpdate:
 *       type: object
 *       required:
 *         - categoryIds
 *         - isPreferred
 *       properties:
 *         categoryIds:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of category IDs to update
 *           example: ["cat_123", "cat_456", "cat_789"]
 *         isPreferred:
 *           type: boolean
 *           description: Whether the categories should be marked as preferred
 *           example: true
 *     CategoryWithPreference:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "cat_123"
 *         name:
 *           type: string
 *           example: "Motivation"
 *         description:
 *           type: string
 *           example: "Motivational affirmations"
 *         isPremium:
 *           type: boolean
 *           example: false
 *         isPreferred:
 *           type: boolean
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-01T00:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-01T00:00:00.000Z"
 */

/**
 * @swagger
 * /user-category-preferences/update-preferences:
 *   put:
 *     summary: Update category preferences for the authenticated user
 *     tags: [UserCategoryPreferences]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoryPreferenceUpdate'
 *     responses:
 *       200:
 *         description: Category preferences updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Category preferences updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     updatedCount:
 *                       type: integer
 *                       example: 3
 *                     categoryIds:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["cat_123", "cat_456", "cat_789"]
 *                     isPreferred:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Bad request - invalid category IDs or missing parameters
 *       401:
 *         description: Unauthorized - authentication required
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /user-category-preferences/categories:
 *   get:
 *     summary: Get all categories with user preference status
 *     tags: [UserCategoryPreferences]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all categories with user preference status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CategoryWithPreference'
 *                 message:
 *                   type: string
 *                   example: "Categories retrieved successfully"
 *       401:
 *         description: Unauthorized - authentication required
 *       500:
 *         description: Internal server error
 */

// Update category preferences with array of category IDs and isPreferred status
router.put(
  "/update-preferences",authenticate,
  userCategoryPreferenceController.updateCategoryPreferences
);

// Get all categories with preference status (isPreferred true/false)
router.get(
  "/categories",authenticate,
  userCategoryPreferenceController.getAllCategoriesWithPreferences
);

module.exports = router;
