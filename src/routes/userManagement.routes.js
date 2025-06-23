const express = require("express");
const router = express.Router();
const userManagementController = require("../controllers/userManagement.controller");
const { authenticate, authorizeRoles } = require("../middleware/auth");

/**
 * @swagger
 * tags:
 *   name: Admin - User Management
 *   description: API for managing users (Admin access required)
 */

// Apply authentication and admin authorization to all routes
router.use(authenticate);
router.use(authorizeRoles("ADMIN"));

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users with pagination and filtering
 *     tags: [Admin - User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search query for firstName, lastName, username, email
 *       - in: query
 *         name: isAdmin
 *         schema:
 *           type: boolean
 *         description: Filter by admin status
 *       - in: query
 *         name: gender
 *         schema:
 *           type: string
 *         description: Filter by gender
 *       - in: query
 *         name: hasSubscription
 *         schema:
 *           type: boolean
 *         description: Filter by subscription status
 *     responses:
 *       200:
 *         description: A list of users
 *       401:
 *         description: Unauthorized
 */
router.get("/", userManagementController.getAllUsers);

/**
 * @swagger
 * /admin/users/statistics:
 *   get:
 *     summary: Get user statistics
 *     tags: [Admin - User Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User statistics
 *       401:
 *         description: Unauthorized
 */
router.get("/statistics", userManagementController.getUserStatistics);

/**
 * @swagger
 * /admin/users/{userId}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Admin - User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User data
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 */
router.get("/:userId", userManagementController.getUserById);

/**
 * @swagger
 * /admin/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Admin - User Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - username
 *               - email
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               phone:
 *                 type: string
 *               gender:
 *                 type: string
 *               dob:
 *                 type: string
 *                 format: date
 *               isAdmin:
 *                 type: boolean
 *               fcmToken:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post("/", userManagementController.createUser);

/**
 * @swagger
 * /admin/users/{userId}:
 *   put:
 *     summary: Update a user
 *     tags: [Admin - User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
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
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               phone:
 *                 type: string
 *               gender:
 *                 type: string
 *               dob:
 *                 type: string
 *                 format: date
 *               isAdmin:
 *                 type: boolean
 *               fcmToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 */
router.put("/:userId", userManagementController.updateUser);

/**
 * @swagger
 * /admin/users/{userId}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Admin - User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 */
router.delete("/:userId", userManagementController.deleteUser);

/**
 * @swagger
 * /admin/users/{userId}/toggle-admin:
 *   patch:
 *     summary: Toggle admin status for a user
 *     tags: [Admin - User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Admin status updated
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 */
router.patch(
  "/:userId/toggle-admin",
  userManagementController.toggleAdminStatus
);

/**
 * @swagger
 * /admin/users/{userId}/activity:
 *   get:
 *     summary: Get user activity
 *     tags: [Admin - User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: User activity log
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 */
router.get("/:userId/activity", userManagementController.getUserActivity);

/**
 * @swagger
 * /admin/users/bulk-update:
 *   post:
 *     summary: Bulk update users
 *     tags: [Admin - User Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               updateData:
 *                 type: object
 *                 properties:
 *                   isAdmin:
 *                     type: boolean
 *                   gender:
 *                     type: string
 *     responses:
 *       200:
 *         description: Users updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post("/bulk-update", userManagementController.bulkUpdateUsers);

/**
 * @swagger
 * /admin/users/bulk-delete:
 *   post:
 *     summary: Bulk delete users
 *     tags: [Admin - User Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Users deleted successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post("/bulk-delete", userManagementController.bulkDeleteUsers);

module.exports = router;
