const express = require("express");
const router = express.Router();
const subscriptionController = require("../controllers/subscription.controller");
const authMiddleware = require("../middleware/auth");

/**
 * @swagger
 * tags:
 *   name: Subscription
 *   description: API for managing user subscriptions and payments
 */

// Apply authentication middleware to protected routes
router.use(authMiddleware.authenticate);

/**
 * @swagger
 * /subscription/create-checkout-session:
 *   post:
 *     summary: Create a Stripe checkout session for subscription
 *     tags: [Subscription]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - planId
 *             properties:
 *               planId:
 *                 type: string
 *                 description: The Stripe price ID for the subscription plan
 *                 example: "price_1234567890"
 *               successUrl:
 *                 type: string
 *                 description: URL to redirect after successful payment
 *                 example: "https://yourapp.com/success"
 *               cancelUrl:
 *                 type: string
 *                 description: URL to redirect if payment is cancelled
 *                 example: "https://yourapp.com/cancel"
 *     responses:
 *       200:
 *         description: Checkout session created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     sessionId:
 *                       type: string
 *                       example: "cs_test_1234567890"
 *                     url:
 *                       type: string
 *                       example: "https://checkout.stripe.com/pay/cs_test_1234567890"
 *       400:
 *         description: Bad request - invalid plan ID or missing parameters
 *       401:
 *         description: Unauthorized - authentication required
 *       500:
 *         description: Internal server error
 */
router.post(
  "/create-checkout-session",
  subscriptionController.createCheckoutSession
);

/**
 * @swagger
 * /subscription/status:
 *   get:
 *     summary: Get current user's subscription status
 *     tags: [Subscription]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User subscription status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     hasSubscription:
 *                       type: boolean
 *                       example: true
 *                     subscription:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "sub_1234567890"
 *                         plan:
 *                           type: string
 *                           example: "premium"
 *                         isActive:
 *                           type: boolean
 *                           example: true
 *                         startDate:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-01-01T00:00:00.000Z"
 *                         endDate:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-02-01T00:00:00.000Z"
 *                         stripeSubscriptionId:
 *                           type: string
 *                           example: "sub_1234567890"
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-01-01T00:00:00.000Z"
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-01-01T00:00:00.000Z"
 *       401:
 *         description: Unauthorized - authentication required
 *       500:
 *         description: Internal server error
 */
router.get("/status", subscriptionController.getUserSubscription);

/**
 * @swagger
 * /subscription/cancel:
 *   post:
 *     summary: Cancel current user's subscription
 *     tags: [Subscription]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Optional reason for cancellation
 *                 example: "Too expensive"
 *               feedback:
 *                 type: string
 *                 description: Optional feedback about the service
 *                 example: "Great service but need to cut costs"
 *     responses:
 *       200:
 *         description: Subscription cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Subscription cancelled successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     subscription:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "sub_1234567890"
 *                         isActive:
 *                           type: boolean
 *                           example: false
 *                         cancelledAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-01-15T00:00:00.000Z"
 *       400:
 *         description: Bad request - no active subscription found
 *       401:
 *         description: Unauthorized - authentication required
 *       500:
 *         description: Internal server error
 */
router.post("/cancel", subscriptionController.cancelSubscription);

/**
 * @swagger
 * /subscription/plans:
 *   get:
 *     summary: Get available subscription plans
 *     tags: [Subscription]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Available plans retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "price_1234567890"
 *                       name:
 *                         type: string
 *                         example: "Premium Plan"
 *                       description:
 *                         type: string
 *                         example: "Access to all premium features"
 *                       price:
 *                         type: number
 *                         example: 9.99
 *                       currency:
 *                         type: string
 *                         example: "usd"
 *                       interval:
 *                         type: string
 *                         example: "month"
 *                       features:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["Unlimited affirmations", "Priority support", "Advanced analytics"]
 *                       isPopular:
 *                         type: boolean
 *                         example: true
 *       401:
 *         description: Unauthorized - authentication required
 *       500:
 *         description: Internal server error
 */
router.get("/plans", subscriptionController.getAvailablePlans);

/**
 * @swagger
 * /subscription/verify-payment:
 *   get:
 *     summary: Verify payment success after checkout
 *     tags: [Subscription]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: session_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Stripe checkout session ID
 *         example: "cs_test_1234567890"
 *     responses:
 *       200:
 *         description: Payment verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Payment verified successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     subscription:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "sub_1234567890"
 *                         plan:
 *                           type: string
 *                           example: "premium"
 *                         isActive:
 *                           type: boolean
 *                           example: true
 *                         startDate:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-01-01T00:00:00.000Z"
 *       400:
 *         description: Bad request - invalid session ID or payment failed
 *       401:
 *         description: Unauthorized - authentication required
 *       404:
 *         description: Session not found
 *       500:
 *         description: Internal server error
 */
router.get("/verify-payment", subscriptionController.verifyPaymentSuccess);

/**
 * @swagger
 * /subscription/test-webhook:
 *   post:
 *     summary: Test webhook processing (for debugging purposes)
 *     tags: [Subscription]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eventType
 *               - eventData
 *             properties:
 *               eventType:
 *                 type: string
 *                 description: Type of Stripe event to simulate
 *                 example: "customer.subscription.created"
 *               eventData:
 *                 type: object
 *                 description: Mock event data for testing
 *                 example:
 *                   subscription_id: "sub_1234567890"
 *                   customer_id: "cus_1234567890"
 *                   status: "active"
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Webhook processed successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     processed:
 *                       type: boolean
 *                       example: true
 *                     eventType:
 *                       type: string
 *                       example: "customer.subscription.created"
 *       400:
 *         description: Bad request - invalid event data
 *       401:
 *         description: Unauthorized - authentication required
 *       500:
 *         description: Internal server error
 */
router.post("/test-webhook", subscriptionController.testWebhookProcessing);

module.exports = router;
