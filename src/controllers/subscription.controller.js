const subscriptionService = require("../services/subscription.service");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

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

      console.log("🔔 Webhook received:", {
        signature: sig ? "Present" : "Missing",
        endpointSecret: endpointSecret ? "Set" : "Missing",
        bodyLength: req.body ? req.body.length : 0,
      });

      let event;

      try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
        console.log("✅ Webhook signature verified");
      } catch (err) {
        console.error("❌ Webhook signature verification failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }

      console.log("📦 Webhook event type:", event.type);
      console.log(
        "📦 Webhook event data:",
        JSON.stringify(event.data.object, null, 2)
      );

      // Handle the event
      switch (event.type) {
        case "checkout.session.completed":
          const session = event.data.object;
          console.log("💳 Checkout session completed:", {
            sessionId: session.id,
            paymentStatus: session.payment_status,
            subscription: session.subscription,
            customer: session.customer,
            metadata: session.metadata,
          });

          if (session.mode === "subscription") {
            console.log("🔄 Processing subscription payment...");
            await subscriptionService.handlePaymentSuccess(session);
            console.log("✅ Subscription payment processed successfully");
          } else {
            console.log("⚠️ Session is not a subscription mode");
          }
          break;

        case "customer.subscription.updated":
          const subscription = event.data.object;
          console.log("📝 Subscription updated:", subscription.id);
          // Handle subscription updates
          break;

        case "customer.subscription.deleted":
          const deletedSubscription = event.data.object;
          console.log("🗑️ Subscription deleted:", deletedSubscription.id);
          // Handle subscription cancellation
          break;

        default:
          console.log(`ℹ️ Unhandled event type ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error("❌ Error handling webhook:", error);
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

      console.log("🔍 Verifying payment:", { session_id, userId });

      if (!session_id) {
        return res.status(400).json({
          success: false,
          message: "Session ID is required",
        });
      }

      // Retrieve the session from Stripe
      const session = await stripe.checkout.sessions.retrieve(session_id);

      console.log("📋 Session details:", {
        id: session.id,
        payment_status: session.payment_status,
        subscription: session.subscription,
        customer: session.customer,
        metadata: session.metadata,
        mode: session.mode,
      });

      if (
        session.payment_status === "paid" &&
        session.metadata.userId === userId
      ) {
        console.log("✅ Payment verified successfully");
        const subscription = await subscriptionService.getUserSubscription(
          userId
        );

        console.log("📊 User subscription status:", subscription);

        res.status(200).json({
          success: true,
          message: "Payment verified successfully",
          subscription: subscription.subscription,
        });
      } else {
        console.log("❌ Payment verification failed:", {
          paymentStatus: session.payment_status,
          expectedUserId: userId,
          actualUserId: session.metadata?.userId,
          paymentStatusMatch: session.payment_status === "paid",
          userIdMatch: session.metadata?.userId === userId,
        });

        res.status(400).json({
          success: false,
          message: "Payment verification failed",
        });
      }
    } catch (error) {
      console.error("❌ Error verifying payment:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Test webhook processing (for debugging)
  async testWebhookProcessing(req, res) {
    try {
      const { session_id } = req.body;

      if (!session_id) {
        return res.status(400).json({
          success: false,
          message: "Session ID is required",
        });
      }

      console.log("🧪 Testing webhook processing for session:", session_id);

      // Retrieve the session from Stripe
      const session = await stripe.checkout.sessions.retrieve(session_id);

      console.log("📋 Test session details:", {
        id: session.id,
        payment_status: session.payment_status,
        subscription: session.subscription,
        customer: session.customer,
        metadata: session.metadata,
        mode: session.mode,
      });

      if (
        session.payment_status === "paid" &&
        session.mode === "subscription"
      ) {
        console.log("🔄 Manually processing payment success...");
        await subscriptionService.handlePaymentSuccess(session);

        res.status(200).json({
          success: true,
          message: "Webhook processing completed successfully",
        });
      } else {
        res.status(400).json({
          success: false,
          message: `Session not ready for processing. Payment status: ${session.payment_status}, Mode: ${session.mode}`,
        });
      }
    } catch (error) {
      console.error("❌ Error in test webhook processing:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new SubscriptionController();
