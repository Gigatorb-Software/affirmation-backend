const { PrismaClient } = require("@prisma/client");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const prisma = new PrismaClient();

class AdminSubscriptionController {
  // Get all subscriptions with filters
  async getAllSubscriptions(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        plan,
        status,
        search,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query;

      const skip = (page - 1) * limit;

      // Build filter conditions
      const where = {};

      if (plan) {
        where.plan = plan;
      }

      if (status === "active") {
        where.isActive = true;
        where.endDate = {
          gt: new Date(),
        };
      } else if (status === "expired") {
        where.OR = [{ isActive: false }, { endDate: { lte: new Date() } }];
      } else if (status === "cancelled") {
        where.isActive = false;
      }

      // Search by user email or name
      if (search) {
        where.user = {
          OR: [
            { email: { contains: search, mode: "insensitive" } },
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
          ],
        };
      }

      // Get subscriptions with user details
      const subscriptions = await prisma.subscription.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              username: true,
              createdAt: true,
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip: parseInt(skip),
        take: parseInt(limit),
      });

      // Get total count for pagination
      const total = await prisma.subscription.count({ where });

      // Calculate pagination info
      const totalPages = Math.ceil(total / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      res.status(200).json({
        success: true,
        data: {
          subscriptions,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalItems: total,
            hasNextPage,
            hasPrevPage,
            limit: parseInt(limit),
          },
        },
      });
    } catch (error) {
      console.error("Error getting all subscriptions:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get subscription statistics
  async getSubscriptionStats(req, res) {
    try {
      const now = new Date();

      // Get total subscriptions
      const totalSubscriptions = await prisma.subscription.count();

      // Get active subscriptions
      const activeSubscriptions = await prisma.subscription.count({
        where: {
          isActive: true,
          endDate: {
            gt: now,
          },
        },
      });

      // Get monthly subscriptions
      const monthlySubscriptions = await prisma.subscription.count({
        where: {
          plan: "monthly",
          isActive: true,
          endDate: {
            gt: now,
          },
        },
      });

      // Get yearly subscriptions
      const yearlySubscriptions = await prisma.subscription.count({
        where: {
          plan: "yearly",
          isActive: true,
          endDate: {
            gt: now,
          },
        },
      });

      // Get expired subscriptions
      const expiredSubscriptions = await prisma.subscription.count({
        where: {
          OR: [{ isActive: false }, { endDate: { lte: now } }],
        },
      });

      // Calculate revenue estimates
      const monthlyRevenue = monthlySubscriptions * 9.99;
      const yearlyRevenue = yearlySubscriptions * 99.99;
      const totalRevenue = monthlyRevenue + yearlyRevenue;

      // Get recent subscriptions (last 30 days)
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const recentSubscriptions = await prisma.subscription.count({
        where: {
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
      });

      // Get subscriptions by month (last 6 months)
      const sixMonthsAgo = new Date(
        now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000
      );
      const monthlyStats = await prisma.subscription.groupBy({
        by: ["plan"],
        where: {
          createdAt: {
            gte: sixMonthsAgo,
          },
        },
        _count: {
          plan: true,
        },
      });

      // Convert BigInt to regular numbers
      const monthlyStatsFormatted = monthlyStats.map((item) => ({
        plan: item.plan,
        _count: {
          plan: Number(item._count.plan),
        },
      }));

      res.status(200).json({
        success: true,
        data: {
          overview: {
            totalSubscriptions: Number(totalSubscriptions),
            activeSubscriptions: Number(activeSubscriptions),
            expiredSubscriptions: Number(expiredSubscriptions),
            recentSubscriptions: Number(recentSubscriptions),
          },
          byPlan: {
            monthly: Number(monthlySubscriptions),
            yearly: Number(yearlySubscriptions),
          },
          revenue: {
            monthly: monthlyRevenue,
            yearly: yearlyRevenue,
            total: totalRevenue,
          },
          monthlyStats: monthlyStatsFormatted,
        },
      });
    } catch (error) {
      console.error("Error getting subscription stats:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get subscription by ID with detailed user info
  async getSubscriptionById(req, res) {
    try {
      const { id } = req.params;

      const subscription = await prisma.subscription.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              username: true,
              phone: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      });

      if (!subscription) {
        return res.status(404).json({
          success: false,
          message: "Subscription not found",
        });
      }

      // Get subscription history (if needed)
      const subscriptionHistory = await prisma.subscription.findMany({
        where: {
          userId: subscription.userId,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      res.status(200).json({
        success: true,
        data: {
          subscription,
          history: subscriptionHistory,
        },
      });
    } catch (error) {
      console.error("Error getting subscription by ID:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Cancel user subscription (admin-triggered)
  async cancelUserSubscription(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const subscription = await prisma.subscription.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      if (!subscription) {
        return res.status(404).json({
          success: false,
          message: "Subscription not found",
        });
      }

      if (!subscription.isActive) {
        return res.status(400).json({
          success: false,
          message: "Subscription is already inactive",
        });
      }

      // Cancel in Stripe if subscription ID exists
      if (subscription.stripeSubscriptionId) {
        try {
          await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
            cancel_at_period_end: true,
          });
          console.log(
            `✅ Stripe subscription ${subscription.stripeSubscriptionId} cancelled`
          );
        } catch (stripeError) {
          console.error("Error cancelling Stripe subscription:", stripeError);
          // Continue with database update even if Stripe fails
        }
      }

      // Update database
      const updatedSubscription = await prisma.subscription.update({
        where: { id },
        data: {
          isActive: false,
          updatedAt: new Date(),
        },
        include: {
          user: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      // Log admin action
      console.log(
        `🚫 Admin cancelled subscription for user ${
          subscription.user.email
        }. Reason: ${reason || "No reason provided"}`
      );

      res.status(200).json({
        success: true,
        message: "Subscription cancelled successfully",
        data: updatedSubscription,
      });
    } catch (error) {
      console.error("Error cancelling user subscription:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Extend user subscription
  async extendUserSubscription(req, res) {
    try {
      const { id } = req.params;
      const { days, reason } = req.body;

      if (!days || days <= 0) {
        return res.status(400).json({
          success: false,
          message: "Valid number of days is required",
        });
      }

      const subscription = await prisma.subscription.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      if (!subscription) {
        return res.status(404).json({
          success: false,
          message: "Subscription not found",
        });
      }

      // Calculate new end date
      const currentEndDate = new Date(subscription.endDate);
      const newEndDate = new Date(
        currentEndDate.getTime() + days * 24 * 60 * 60 * 1000
      );

      // Update subscription
      const updatedSubscription = await prisma.subscription.update({
        where: { id },
        data: {
          endDate: newEndDate,
          isActive: true,
          updatedAt: new Date(),
        },
        include: {
          user: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      // Log admin action
      console.log(
        `📅 Admin extended subscription for user ${
          subscription.user.email
        } by ${days} days. Reason: ${reason || "No reason provided"}`
      );

      res.status(200).json({
        success: true,
        message: `Subscription extended by ${days} days`,
        data: updatedSubscription,
      });
    } catch (error) {
      console.error("Error extending user subscription:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get subscription analytics
  async getSubscriptionAnalytics(req, res) {
    try {
      const { period = "30" } = req.query; // days
      const days = parseInt(period);
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      // Get new subscriptions over the period
      const newSubscriptions = await prisma.subscription.count({
        where: {
          createdAt: {
            gte: startDate,
          },
        },
      });

      // Get cancelled subscriptions over the period
      const cancelledSubscriptions = await prisma.subscription.count({
        where: {
          updatedAt: {
            gte: startDate,
          },
          isActive: false,
        },
      });

      // Get subscriptions by plan over the period
      const subscriptionsByPlan = await prisma.subscription.groupBy({
        by: ["plan"],
        where: {
          createdAt: {
            gte: startDate,
          },
        },
        _count: {
          plan: true,
        },
      });

      // Convert BigInt to regular numbers
      const subscriptionsByPlanFormatted = subscriptionsByPlan.map((item) => ({
        plan: item.plan,
        _count: {
          plan: Number(item._count.plan),
        },
      }));

      // Get daily subscription counts using raw query to avoid BigInt issues
      const dailyStats = await prisma.$queryRaw`
        SELECT 
          DATE(createdAt) as date,
          COUNT(*) as count,
          plan
        FROM Subscription 
        WHERE createdAt >= ${startDate}
        GROUP BY DATE(createdAt), plan
        ORDER BY date DESC
      `;

      // Convert BigInt to regular numbers in daily stats
      const dailyStatsFormatted = dailyStats.map((item) => ({
        date: item.date,
        count: Number(item.count),
        plan: item.plan,
      }));

      res.status(200).json({
        success: true,
        data: {
          period: `${days} days`,
          newSubscriptions: Number(newSubscriptions),
          cancelledSubscriptions: Number(cancelledSubscriptions),
          subscriptionsByPlan: subscriptionsByPlanFormatted,
          dailyStats: dailyStatsFormatted,
        },
      });
    } catch (error) {
      console.error("Error getting subscription analytics:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new AdminSubscriptionController();
