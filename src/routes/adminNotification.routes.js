const express = require("express");
const router = express.Router();
const adminNotificationController = require("../controllers/adminNotification.controller");
const { authenticate } = require("../middleware/auth");

// All routes require authentication
router.use(authenticate);

router.post(
  "/schedule/affirmations",
  adminNotificationController.setAffirmationSchedule
);
router.post(
  "/schedule/community-update",
  adminNotificationController.scheduleCommunityUpdate
);
router.post(
  "/schedule/announcement",
  adminNotificationController.scheduleAnnouncement
);
router.post("/broadcast", adminNotificationController.manualBroadcast);

module.exports = router;
