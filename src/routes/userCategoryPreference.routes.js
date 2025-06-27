const express = require("express");
const router = express.Router();
const userCategoryPreferenceController = require("../controllers/userCategoryPreference.controller");
const { authenticate, authorizeRoles } = require("../middleware/auth");

// All routes require authentication
router.use(authenticate);

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
 *     UserCategoryPreference:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         userId:
 *           type: string
 *         categoryId:
 *           type: string
 *         isPreferred:
 *           type: boolean
 *         priority:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         category:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             name:
 *               type: string
 *             description:
 *               type: string
 *             isPremium:
 *               type: boolean
 *     UserCategoryPreferenceInput:
 *       type: object
 *       properties:
 *         isPreferred:
 *           type: boolean
 *         priority:
 *           type: integer
 *     UserCategoryPreferenceBulkInput:
 *       type: object
 *       properties:
 *         preferences:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               categoryId:
 *                 type: string
 *               isPreferred:
 *                 type: boolean
 *               priority:
 *                 type: integer
 */

/**
 * @swagger
 * /user-category-preferences:
 *   get:
 *     summary: Get all category preferences for the authenticated user
 *     tags: [UserCategoryPreferences]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user category preferences
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserCategoryPreference'
 *                 message:
 *                   type: string
 */

/**
 * @swagger
 * /user-category-preferences/preferred:
 *   get:
 *     summary: Get preferred categories for the authenticated user
 *     tags: [UserCategoryPreferences]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of preferred categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
 *                 message:
 *                   type: string
 */

/**
 * @swagger
 * /user-category-preferences/categories-with-preferences:
 *   get:
 *     summary: Get all categories with user preference status
 *     tags: [UserCategoryPreferences]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of categories with user preference status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 message:
 *                   type: string
 */

/**
 * @swagger
 * /user-category-preferences/{categoryId}:
 *   get:
 *     summary: Get a specific category preference for the authenticated user
 *     tags: [UserCategoryPreferences]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         schema:
 *           type: string
 *         required: true
 *         description: Category ID
 *     responses:
 *       200:
 *         description: User category preference
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/UserCategoryPreference'
 *                 message:
 *                   type: string
 *   post:
 *     summary: Create or update a category preference for the authenticated user
 *     tags: [UserCategoryPreferences]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         schema:
 *           type: string
 *         required: true
 *         description: Category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserCategoryPreferenceInput'
 *     responses:
 *       200:
 *         description: User category preference created/updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/UserCategoryPreference'
 *                 message:
 *                   type: string
 *   delete:
 *     summary: Delete a category preference for the authenticated user
 *     tags: [UserCategoryPreferences]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         schema:
 *           type: string
 *         required: true
 *         description: Category ID
 *     responses:
 *       200:
 *         description: User category preference deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/UserCategoryPreference'
 *                 message:
 *                   type: string
 */

/**
 * @swagger
 * /user-category-preferences/bulk:
 *   put:
 *     summary: Update multiple category preferences for the authenticated user
 *     tags: [UserCategoryPreferences]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserCategoryPreferenceBulkInput'
 *     responses:
 *       200:
 *         description: User category preferences updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserCategoryPreference'
 *                 message:
 *                   type: string
 */

/**
 * @swagger
 * /user-category-preferences:
 *   delete:
 *     summary: Delete all category preferences for the authenticated user
 *     tags: [UserCategoryPreferences]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All user category preferences deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     deletedCount:
 *                       type: integer
 *                 message:
 *                   type: string
 */

/**
 * @swagger
 * /user-category-preferences/admin/{userId}:
 *   get:
 *     summary: (Admin) Get category preferences for any user
 *     tags: [UserCategoryPreferences]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: List of user category preferences
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserCategoryPreference'
 *                 message:
 *                   type: string
 *   put:
 *     summary: (Admin) Update category preferences for any user
 *     tags: [UserCategoryPreferences]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserCategoryPreferenceBulkInput'
 *     responses:
 *       200:
 *         description: User category preferences updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserCategoryPreference'
 *                 message:
 *                   type: string
 */

// User routes
router.get("/", userCategoryPreferenceController.getUserCategoryPreferences);
router.get(
  "/preferred",
  userCategoryPreferenceController.getUserPreferredCategories
);
router.get(
  "/categories-with-preferences",
  userCategoryPreferenceController.getCategoriesWithUserPreferences
);
router.get(
  "/:categoryId",
  userCategoryPreferenceController.getUserCategoryPreference
);
router.post(
  "/:categoryId",
  userCategoryPreferenceController.createOrUpdateUserCategoryPreference
);
router.put(
  "/bulk",
  userCategoryPreferenceController.updateUserCategoryPreferences
);
router.delete(
  "/:categoryId",
  userCategoryPreferenceController.deleteUserCategoryPreference
);
router.delete(
  "/",
  userCategoryPreferenceController.deleteAllUserCategoryPreferences
);

// Admin routes
router.get(
  "/admin/:userId",
  userCategoryPreferenceController.getAdminUserCategoryPreferences
);
router.put(
  "/admin/:userId",
  userCategoryPreferenceController.updateAdminUserCategoryPreferences
);

module.exports = router;
