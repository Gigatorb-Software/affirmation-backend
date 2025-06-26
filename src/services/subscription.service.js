const { PrismaClient } = require("@prisma/client");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

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
      const { userId, planType } = session.metadata;

      // Get subscription details from Stripe
      const subscription = await stripe.subscriptions.retrieve(
        session.subscription
      );

      // Update or create subscription in database
      const subscriptionData = {
        plan: planType,
        startDate: new Date(subscription.current_period_start * 1000),
        endDate: new Date(subscription.current_period_end * 1000),
        isActive: subscription.status === "active",
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer,
      };

      await prisma.subscription.upsert({
        where: { userId },
        update: subscriptionData,
        create: {
          ...subscriptionData,
          userId,
        },
      });

      return { success: true, subscription: subscriptionData };
    } catch (error) {
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
