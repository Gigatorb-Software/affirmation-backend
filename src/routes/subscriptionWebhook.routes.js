const express = require("express");
const router = express.Router();
const subscriptionController = require("../controllers/subscription.controller");

// Stripe webhook - no auth, needs raw body
router.post("/", subscriptionController.handleWebhook);

module.exports = router;
