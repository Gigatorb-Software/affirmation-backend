const express = require("express");
const router = express.Router();
const adminNotificationController = require("../controllers/adminNotification.controller");
const { authenticate } = require("../middleware/auth");

/**
 * @swagger
 * tags:
 *   name: Admin - Notifications
 *   description: API for sending notifications from admin
 */

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /admin/notifications/schedule/affirmations:
 *   post:
 *     summary: Set the affirmation notification schedule
 *     tags: [Admin - Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               times:
 *                 type: array
 *                 items:
 *                   type: string
 *                   example: "14:30"
 *               count:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Affirmation schedule set
 */
router.post(
  "/schedule/affirmations",
  adminNotificationController.setAffirmationSchedule
);

/**
 * @swagger
 * /admin/notifications/schedule/community-update:
 *   post:
 *     summary: Schedule a community update notification
 *     tags: [Admin - Notifications]
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
 *               body:
 *                 type: string
 *               time:
 *                 type: string
 *                 format: date-time
 *               target:
 *                 type: string
 *                 description: e.g., 'premium' or 'all'
 *     responses:
 *       200:
 *         description: Community update scheduled
 */
router.post(
  "/schedule/community-update",
  adminNotificationController.scheduleCommunityUpdate
);

/**
 * @swagger
 * /admin/notifications/schedule/announcement:
 *   post:
 *     summary: Schedule a system announcement
 *     tags: [Admin - Notifications]
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
 *               body:
 *                 type: string
 *               time:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: System announcement scheduled
 */
router.post(
  "/schedule/announcement",
  adminNotificationController.scheduleAnnouncement
);

/**
 * @swagger
 * /admin/notifications/broadcast:
 *   post:
 *     summary: Send a manual broadcast immediately
 *     tags: [Admin - Notifications]
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
 *               body:
 *                 type: string
 *               target:
 *                 type: string
 *                 description: e.g., 'premium' or 'all'
 *     responses:
 *       200:
 *         description: Broadcast sent
 */
router.post("/broadcast", adminNotificationController.manualBroadcast);

/**
 * @swagger
 * /admin/notifications/send-to-all:
 *   post:
 *     summary: Send a notification to all users
 *     tags: [Admin - Notifications]
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
 *               body:
 *                 type: string
 *     responses:
 *       200:
 *         description: Notification sent to all users
 */
router.post("/send-to-all", adminNotificationController.sendToAll);

/**
 * @swagger
 * /admin/notifications/send-to-user/{userId}:
 *   post:
 *     summary: Send a notification to a specific user
 *     tags: [Admin - Notifications]
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
 *               title:
 *                 type: string
 *               body:
 *                 type: string
 *     responses:
 *       200:
 *         description: Notification sent to the user
 */
router.post("/send-to-user/:userId", adminNotificationController.sendToUser);

module.exports = router;
