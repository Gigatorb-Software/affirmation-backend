const { PrismaClient } = require("@prisma/client");
const stripe = require("dotenv").config({
  path: require("path").resolve(__dirname, "../../.env"),
});

const prisma = new PrismaClient();

class SubscriptionService {
  // Create a Stripe checkout session
  async createCheckoutSession(userId, planType) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { subscription: true },
      });

      if (!user) {
        throw new Error("User not found");
      }

      // Define plan configurations
      const plans = {
        monthly: {
          priceId: process.env.STRIPE_MONTHLY_PRICE_ID,
          name: "Premium Monthly",
          interval: "month",
        },
        yearly: {
          priceId: process.env.STRIPE_YEARLY_PRICE_ID,
          name: "Premium Yearly",
          interval: "year",
        },
      };

      const plan = plans[planType];
      if (!plan) {
        throw new Error("Invalid plan type");
      }

      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price: plan.priceId,
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${process.env.FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/subscription/cancel`,
        customer_email: user.email,
        metadata: {
          userId: userId,
          planType: planType,
        },
      });

      return session;
    } catch (error) {
      throw new Error(`Failed to create checkout session: ${error.message}`);
    }
  }

  // Handle successful payment webhook
  async handlePaymentSuccess(session) {
    try {
      console.log(
        "🔄 Starting payment success handling for session:",
        session.id
      );

      const { userId, planType } = session.metadata;
      console.log("👤 User and plan details:", { userId, planType });

      // Get subscription details from Stripe
      console.log(
        "📞 Retrieving subscription from Stripe:",
        session.subscription
      );
      const subscription = await stripe.subscriptions.retrieve(
        session.subscription
      );
      console.log("📋 Stripe subscription details:", {
        id: subscription.id,
        status: subscription.status,
        customer: subscription.customer,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
      });

      // Handle date conversion with fallbacks
      const now = new Date();
      const startDate = subscription.current_period_start
        ? new Date(subscription.current_period_start * 1000)
        : now;

      const endDate = subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000)
        : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

      console.log("📅 Calculated dates:", {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        originalStart: subscription.current_period_start,
        originalEnd: subscription.current_period_end,
      });

      // Update or create subscription in database
      const subscriptionData = {
        plan: planType,
        startDate: startDate,
        endDate: endDate,
        isActive: subscription.status === "active",
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer,
      };

      console.log("💾 Saving subscription data to database:", subscriptionData);

      const result = await prisma.subscription.upsert({
        where: { userId },
        update: subscriptionData,
        create: {
          ...subscriptionData,
          userId,
        },
      });

      console.log("✅ Subscription saved to database:", result);

      return { success: true, subscription: subscriptionData };
    } catch (error) {
      console.error("❌ Error in handlePaymentSuccess:", error);
      throw new Error(`Failed to handle payment success: ${error.message}`);
    }
  }

  // Get user's subscription status
  async getUserSubscription(userId) {
    try {
      const subscription = await prisma.subscription.findUnique({
        where: { userId },
        include: {
          user: {
            select: { id: true, email: true, firstName: true, lastName: true },
          },
        },
      });

      if (!subscription) {
        return { hasSubscription: false, subscription: null };
      }

      // Check if subscription is still active
      const isActive =
        subscription.isActive && subscription.endDate > new Date();

      return {
        hasSubscription: true,
        subscription: {
          ...subscription,
          isActive,
        },
      };
    } catch (error) {
      throw new Error(`Failed to get user subscription: ${error.message}`);
    }
  }

  // Cancel subscription
  async cancelSubscription(userId) {
    try {
      const subscription = await prisma.subscription.findUnique({
        where: { userId },
      });

      if (!subscription) {
        throw new Error("No subscription found");
      }

      if (subscription.stripeSubscriptionId) {
        // Cancel in Stripe
        await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
          cancel_at_period_end: true,
        });
      }

      // Update in database
      await prisma.subscription.update({
        where: { userId },
        data: { isActive: false },
      });

      return { success: true, message: "Subscription cancelled successfully" };
    } catch (error) {
      throw new Error(`Failed to cancel subscription: ${error.message}`);
    }
  }

  // Get available plans
  async getAvailablePlans() {
    try {
      const plans = [
        {
          id: "monthly",
          name: "Premium Monthly",
          price: 9.99,
          interval: "month",
          features: [
            "Unlimited affirmations",
            "Premium categories",
            "Advanced analytics",
            "Priority support",
          ],
        },
        {
          id: "yearly",
          name: "Premium Yearly",
          price: 99.99,
          interval: "year",
          features: [
            "All monthly features",
            "2 months free",
            "Exclusive content",
            "Early access to new features",
          ],
          savings: "Save 17%",
        },
      ];

      return plans;
    } catch (error) {
      throw new Error(`Failed to get available plans: ${error.message}`);
    }
  }
}

module.exports = new SubscriptionService();
