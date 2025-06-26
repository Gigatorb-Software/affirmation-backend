const subscriptionService = require("../services/subscription.service");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class SubscriptionController {
  // Create checkout session
  async createCheckoutSession(req, res) {
    try {
      const { planType } = req.body;
      const userId = req.user.id;

      if (!planType || !["monthly", "yearly"].includes(planType)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid plan type. Must be "monthly" or "yearly"',
        });
      }

      const session = await subscriptionService.createCheckoutSession(
        userId,
        planType
      );

      res.status(200).json({
        success: true,
        sessionId: session.id,
        url: session.url,
      });
    } catch (error) {
      console.error("Error creating checkout session:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get user subscription status
  async getUserSubscription(req, res) {
    try {
      const userId = req.user.id;
      const subscription = await subscriptionService.getUserSubscription(
        userId
      );

      res.status(200).json({
        success: true,
        ...subscription,
      });
    } catch (error) {
      console.error("Error getting user subscription:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Cancel subscription
  async cancelSubscription(req, res) {
    try {
      const userId = req.user.id;
      const result = await subscriptionService.cancelSubscription(userId);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get available plans
  async getAvailablePlans(req, res) {
    try {
      const plans = await subscriptionService.getAvailablePlans();

      res.status(200).json({
        success: true,
        plans,
      });
    } catch (error) {
      console.error("Error getting available plans:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Stripe webhook handler
  async handleWebhook(req, res) {
    try {
      const sig = req.headers["stripe-signature"];
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

      let event;

      try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      } catch (err) {
        console.error("Webhook signature verification failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }

      // Handle the event
      switch (event.type) {
        case "checkout.session.completed":
          const session = event.data.object;
          if (session.mode === "subscription") {
            await subscriptionService.handlePaymentSuccess(session);
          }
          break;

        case "customer.subscription.updated":
          const subscription = event.data.object;
          // Handle subscription updates
          break;

        case "customer.subscription.deleted":
          const deletedSubscription = event.data.object;
          // Handle subscription cancellation
          break;

        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error("Error handling webhook:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Verify payment success
  async verifyPaymentSuccess(req, res) {
    try {
      const { session_id } = req.query;
      const userId = req.user.id;

      if (!session_id) {
        return res.status(400).json({
          success: false,
          message: "Session ID is required",
        });
      }

      // Retrieve the session from Stripe
      const session = await stripe.checkout.sessions.retrieve(session_id);

      if (
        session.payment_status === "paid" &&
        session.metadata.userId === userId
      ) {
        const subscription = await subscriptionService.getUserSubscription(
          userId
        );

        res.status(200).json({
          success: true,
          message: "Payment verified successfully",
          subscription: subscription.subscription,
        });
      } else {
        res.status(400).json({
          success: false,
          message: "Payment verification failed",
        });
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new SubscriptionController();
