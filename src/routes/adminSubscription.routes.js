const express = require("express");
const router = express.Router();
const adminSubscriptionController = require("../controllers/adminSubscription.controller");
const authMiddleware = require("../middleware/auth");
const { authorizeRoles } = require("../middleware/auth");

// Apply authentication and admin authorization to all routes
router.use(authMiddleware.authenticate);
router.use(authorizeRoles("ADMIN"));

// Get all subscriptions with filters
router.get("/subscriptions", adminSubscriptionController.getAllSubscriptions);

// Get subscription statistics
router.get(
  "/subscriptions/stats",
  adminSubscriptionController.getSubscriptionStats
);

// Get subscription analytics
router.get(
  "/subscriptions/analytics",
  adminSubscriptionController.getSubscriptionAnalytics
);

// Get subscription by ID with detailed user info
router.get(
  "/subscriptions/:id",
  adminSubscriptionController.getSubscriptionById
);

// Cancel user subscription (admin-triggered)
router.post(
  "/subscriptions/:id/cancel",
  adminSubscriptionController.cancelUserSubscription
);

// Extend user subscription
router.post(
  "/subscriptions/:id/extend",
  adminSubscriptionController.extendUserSubscription
);

module.exports = router;
