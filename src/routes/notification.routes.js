const express = require("express");
const router = express.Router();
const notificationService = require("../services/notification.service");
const { authenticate } = require("../middleware/auth");
const admin = require("firebase-admin");

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

// Get user's notifications
router.get("/", authenticate, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const notifications = await notificationService.getUserNotifications(
      req.user.id,
      page,
      limit
    );
    res.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mark notification as read
router.put("/:id/read", authenticate, async (req, res) => {
  try {
    await notificationService.markNotificationAsRead(
      req.params.id,
      req.user.id
    );
    res.json({ success: true });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
