const express = require("express");
const router = express.Router();
const userManagementService = require("../services/userManagement.service");
const { authenticate } = require("../middleware/auth");

/**
 * @swagger
 * tags:
 *   name: User Profile
 *   description: API for user profile management
 */

// Apply authentication to all routes
router.use(authenticate);

/**
 * @swagger
 * /user/profile:
 *   get:
 *     summary: Get current user's profile
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user's profile data
 *       401:
 *         description: Unauthorized
 */
router.get("/profile", async (req, res) => {
  try {
    const user = await userManagementService.getUserById(req.user.id);
    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /user/profile:
 *   put:
 *     summary: Update current user's profile
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
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
 *               fcmToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.put("/profile", async (req, res) => {
  try {
    const user = await userManagementService.updateCurrentUserProfile(
      req.user.id,
      req.body
    );
    res.json({
      success: true,
      data: user,
      message: "Profile updated successfully",
    });
  } catch (error) {
    if (error.message.includes("already exists")) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /user/users:
 *   get:
 *     summary: Get all users (public information only)
 *     tags: [User Profile]
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
 *         description: Search query for firstName, lastName, username
 *       - in: query
 *         name: gender
 *         schema:
 *           type: string
 *         description: Filter by gender
 *     responses:
 *       200:
 *         description: A list of users (public information only)
 *       401:
 *         description: Unauthorized
 */
router.get("/users", async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", gender } = req.query;

    const filters = {
      ...(gender && { gender }),
    };

    const result = await userManagementService.getAllPublicUsers(
      parseInt(page),
      parseInt(limit),
      search,
      filters
    );

    res.json({
      success: true,
      data: result.users,
      pagination: result.pagination,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /user/users/{userId}:
 *   get:
 *     summary: Get a user's public profile by ID
 *     tags: [User Profile]
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
 *         description: User's public profile data
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 */
router.get("/users/:userId", async (req, res) => {
  try {
    const user = await userManagementService.getPublicUserById(
      req.params.userId
    );
    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    if (error.message === "User not found") {
      return res.status(404).json({
        success: false,
        error: error.message,
      });
    }
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
