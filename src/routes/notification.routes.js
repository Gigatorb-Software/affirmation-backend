const express = require("express");
const router = express.Router();
const notificationService = require("../services/notification.service");
const { authenticate } = require("../middleware/auth");
const admin = require("firebase-admin");
const notificationController = require("../controllers/notification.controller");

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: API for managing user notifications
 */

/**
 * @swagger
 * /notifications/token:
 *   post:
 *     summary: Save or update the FCM token for the authenticated user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: FCM token saved successfully
 */
// Save FCM token
router.post("/token", authenticate, async (req, res) => {
  try {
    const { token } = req.body;
    await notificationService.saveUserFCMToken(req.user.id, token);
    res.json({ success: true });
  } catch (error) {
    console.error("Error saving FCM token:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /notifications/token/remove:
 *   post:
 *     summary: Remove the FCM token for the authenticated user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: FCM token removed successfully
 */
// Remove FCM token
router.post("/token/remove", authenticate, async (req, res) => {
  try {
    await notificationService.removeUserFCMToken(req.user.id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error removing FCM token:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /notifications/test:
 *   post:
 *     summary: Send a test notification to the authenticated user
 *     tags: [Notifications]
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
 *         description: Test notification sent
 */
// Test immediate notification
router.post("/test", authenticate, async (req, res) => {
  try {
    const { title, body } = req.body;

    if (!title || !body) {
      return res.status(400).json({
        success: false,
        error: "Title and body are required",
      });
    }

    console.log("Sending test notification to user:", req.user.id);
    console.log("Notification payload:", { title, body });

    const result = await notificationService.sendNotification(req.user.id, {
      title,
      body,
      type: "TEST",
    });

    console.log("Notification sent successfully:", result);
    res.json({ success: true, result });
  } catch (error) {
    console.error("Error sending test notification:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      userId: req.user?.id,
    });
    res.status(500).json({
      success: false,
      error: error.message,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

/**
 * @swagger
 * /notifications/test-scheduled:
 *   post:
 *     summary: Send a scheduled test notification
 *     tags: [Notifications]
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
 *               delay:
 *                 type: integer
 *                 description: Delay in seconds
 *     responses:
 *       200:
 *         description: Test notification scheduled
 */
// Test scheduled notification
router.post("/test-scheduled", authenticate, async (req, res) => {
  try {
    const { title, body, delay } = req.body;

    if (!title || !body || !delay) {
      return res.status(400).json({
        success: false,
        error: "Title, body, and delay are required",
      });
    }

    // Schedule notification after delay seconds
    setTimeout(async () => {
      try {
        await notificationService.sendNotification(req.user.id, {
          title,
          body,
          type: "TEST",
        });
      } catch (error) {
        console.error("Error sending scheduled notification:", error);
      }
    }, delay * 1000);

    res.json({
      success: true,
      message: `Notification scheduled for ${delay} seconds`,
    });
  } catch (error) {
    console.error("Error scheduling notification:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /notifications/validate-token:
 *   post:
 *     summary: Validate an FCM token (dry run)
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token is valid
 *       500:
 *         description: Token is invalid
 */
// Standalone Token Validation Route
router.post("/validate-token", async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: "Token is required" });
  }

  try {
    console.log("Starting standalone token validation for token:", token);
    await admin.messaging().send({ token: token }, true); // dry run
    console.log("Standalone token validation successful");
    res.status(200).json({ success: true, message: "Token is valid" });
  } catch (error) {
    console.error("Standalone token validation failed:", error);
    res.status(500).json({
      success: false,
      message: "Token is invalid",
      error: {
        code: error.code,
        message: error.message,
      },
    });
  }
});

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Get all notifications for the current user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of notifications
 */
router.get("/", notificationController.getUserNotifications);

/**
 * @swagger
 * /notifications/{id}/read:
 *   patch:
 *     summary: Mark a notification as read
 *     tags: [Notifications]
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
 *         description: Notification marked as read
 */
router.patch("/:id/read", notificationController.markAsRead);

/**
 * @swagger
 * /notifications/read-all:
 *   patch:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 */
router.patch("/read-all", notificationController.markAllAsRead);

/**
 * @swagger
 * /notifications/{id}:
 *   delete:
 *     summary: Delete a notification
 *     tags: [Notifications]
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
 *         description: Notification deleted successfully
 */
router.delete("/:id", notificationController.deleteNotification);

module.exports = router;
