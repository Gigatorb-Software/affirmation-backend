const express = require("express");
const router = express.Router();
const subscriptionController = require("../controllers/subscription.controller");
const authMiddleware = require("../middleware/auth");

// Stripe webhook (no auth required)
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  subscriptionController.handleWebhook
);

// Apply authentication middleware to protected routes
router.use(authMiddleware.authenticate);

// Create checkout session
router.post(
  "/create-checkout-session",
  subscriptionController.createCheckoutSession
);

// Get user subscription status
router.get("/status", subscriptionController.getUserSubscription);

// Cancel subscription
router.post("/cancel", subscriptionController.cancelSubscription);

// Get available plans
router.get("/plans", subscriptionController.getAvailablePlans);

// Verify payment success
router.get("/verify-payment", subscriptionController.verifyPaymentSuccess);

module.exports = router;
