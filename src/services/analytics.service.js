const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class AnalyticsService {
  // Get affirmation analytics
  async getAffirmationAnalytics() {
    try {
      const [
        totalAffirmations,
        totalHistory,
        categoryStats,
        popularAffirmations,
        dailyUsage,
        completionRate,
      ] = await Promise.all([
        // Total affirmations
        prisma.affirmation.count(),

        // Total affirmation history records
        prisma.affirmationHistory.count(),

        // Affirmations by category
        prisma.affirmation.groupBy({
          by: ["categoryId"],
          _count: {
            id: true,
          },
        }),

        // Most popular affirmations (by usage count)
        prisma.affirmationHistory.groupBy({
          by: ["affirmationId"],
          _count: {
            id: true,
          },
          orderBy: {
            _count: {
              id: "desc",
            },
          },
          take: 10,
        }),

        // Daily usage for the last 30 days
        this.getDailyAffirmationUsage(),

        // Completion rate
        this.getAffirmationCompletionRate(),
      ]);

      // Get category names for the category stats
      const categoryIds = categoryStats.map((stat) => stat.categoryId);
      const categories = await prisma.category.findMany({
        where: {
          id: {
            in: categoryIds,
          },
        },
        select: {
          id: true,
          name: true,
        },
      });

      // Get affirmation details for popular affirmations
      const affirmationIds = popularAffirmations.map(
        (item) => item.affirmationId
      );
      const affirmations = await prisma.affirmation.findMany({
        where: {
          id: {
            in: affirmationIds,
          },
        },
        include: {
          category: {
            select: {
              name: true,
            },
          },
        },
      });

      return {
        totalAffirmations,
        totalUsage: totalHistory,
        categoryStats: categoryStats.map((stat) => {
          const category = categories.find((cat) => cat.id === stat.categoryId);
          return {
            categoryName: category ? category.name : "Unknown",
            count: stat._count.id,
          };
        }),
        popularAffirmations: popularAffirmations.map((item) => {
          const affirmation = affirmations.find(
            (aff) => aff.id === item.affirmationId
          );
          return {
            content: affirmation ? affirmation.content : "Unknown",
            category: affirmation?.category?.name || "Unknown",
            usageCount: item._count.id,
          };
        }),
        dailyUsage,
        completionRate,
      };
    } catch (error) {
      console.error("Error getting affirmation analytics:", error);
      throw error;
    }
  }

  // Get daily affirmation usage for the last 30 days
  async getDailyAffirmationUsage() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const dailyStats = await prisma.$queryRaw`
      SELECT 
        DATE(seenAt) as date,
        COUNT(*) as count
      FROM AffirmationHistory 
      WHERE seenAt >= ${thirtyDaysAgo}
      GROUP BY DATE(seenAt)
      ORDER BY date DESC
    `;

    return dailyStats.map((item) => ({
      date: item.date,
      count: Number(item.count),
    }));
  }

  // Get affirmation completion rate
  async getAffirmationCompletionRate() {
    const [totalHistory, completedHistory] = await Promise.all([
      prisma.affirmationHistory.count(),
      prisma.affirmationHistory.count({
        where: {
          isCompleted: true,
        },
      }),
    ]);

    return {
      total: totalHistory,
      completed: completedHistory,
      rate: totalHistory > 0 ? (completedHistory / totalHistory) * 100 : 0,
    };
  }

  // Get post analytics
  async getPostAnalytics() {
    try {
      const [totalPosts, postsByType, weeklyVolume, engagementStats] =
        await Promise.all([
          // Total posts
          prisma.post.count(),

          // Posts by type
          prisma.post.groupBy({
            by: ["postType"],
            _count: {
              id: true,
            },
          }),

          // Weekly post volume
          this.getWeeklyPostVolume(),

          // Engagement statistics
          this.getPostEngagementStats(),
        ]);

      return {
        totalPosts,
        postsByType: postsByType.map((type) => ({
          type: type.postType,
          count: type._count.id,
        })),
        weeklyVolume,
        engagementStats,
      };
    } catch (error) {
      console.error("Error getting post analytics:", error);
      throw error;
    }
  }

  // Get weekly post volume
  async getWeeklyPostVolume() {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const weeklyStats = await prisma.$queryRaw`
      SELECT 
        DAYNAME(createdAt) as day,
        COUNT(*) as count
      FROM Post 
      WHERE createdAt >= ${sevenDaysAgo}
      GROUP BY DAYNAME(createdAt)
    `;

    // Define the order of days
    const dayOrder = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    // Sort the results by day order
    const sortedStats = weeklyStats.sort((a, b) => {
      const aIndex = dayOrder.indexOf(a.day);
      const bIndex = dayOrder.indexOf(b.day);
      return aIndex - bIndex;
    });

    return sortedStats.map((item) => ({
      day: item.day.substring(0, 3), // Short day name
      posts: Number(item.count),
    }));
  }

  // Get post engagement statistics
  async getPostEngagementStats() {
    const [totalLikes, totalComments] = await Promise.all([
      prisma.postLike.count(),
      prisma.comment.count(),
    ]);

    // Get average likes per post using a different approach
    const postsWithLikes = await prisma.post.findMany({
      select: {
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    const totalPosts = postsWithLikes.length;
    const totalLikesFromPosts = postsWithLikes.reduce(
      (sum, post) => sum + post._count.likes,
      0
    );
    const totalCommentsFromPosts = postsWithLikes.reduce(
      (sum, post) => sum + post._count.comments,
      0
    );

    return {
      totalLikes,
      totalComments,
      avgLikesPerPost: totalPosts > 0 ? totalLikesFromPosts / totalPosts : 0,
      avgCommentsPerPost:
        totalPosts > 0 ? totalCommentsFromPosts / totalPosts : 0,
    };
  }

  // Get user growth analytics
  async getUserGrowthAnalytics() {
    try {
      const sixMonthsAgo = new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000);

      const monthlySignups = await prisma.$queryRaw`
        SELECT 
          DATE_FORMAT(createdAt, '%Y-%m') as month,
          COUNT(*) as count
        FROM User 
        WHERE createdAt >= ${sixMonthsAgo}
        GROUP BY DATE_FORMAT(createdAt, '%Y-%m')
        ORDER BY month DESC
        LIMIT 6
      `;

      return monthlySignups.map((item) => ({
        month: item.month,
        users: Number(item.count),
      }));
    } catch (error) {
      console.error("Error getting user growth analytics:", error);
      throw error;
    }
  }

  // Get comprehensive dashboard analytics
  async getDashboardAnalytics() {
    try {
      const [
        userStats,
        subscriptionStats,
        affirmationAnalytics,
        postAnalytics,
        userGrowth,
      ] = await Promise.all([
        this.getUserStatistics(),
        this.getSubscriptionStatistics(),
        this.getAffirmationAnalytics(),
        this.getPostAnalytics(),
        this.getUserGrowthAnalytics(),
      ]);

      return {
        users: userStats,
        subscriptions: subscriptionStats,
        affirmations: affirmationAnalytics,
        posts: postAnalytics,
        userGrowth,
      };
    } catch (error) {
      console.error("Error getting dashboard analytics:", error);
      throw error;
    }
  }

  // Get user statistics
  async getUserStatistics() {
    const [totalUsers, activeUsers, newUsersThisMonth, usersWithSubscription] =
      await Promise.all([
        prisma.user.count(),
        this.getActiveUsersCount(),
        this.getNewUsersThisMonth(),
        prisma.user.count({
          where: {
            subscription: {
              isNot: null,
            },
          },
        }),
      ]);

    return {
      total: totalUsers,
      active: activeUsers,
      newThisMonth: newUsersThisMonth,
      withSubscription: usersWithSubscription,
      withoutSubscription: totalUsers - usersWithSubscription,
    };
  }

  // Get active users count (users with activity in last 30 days)
  async getActiveUsersCount() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    return prisma.user.count({
      where: {
        OR: [
          {
            posts: {
              some: {
                createdAt: {
                  gte: thirtyDaysAgo,
                },
              },
            },
          },
          {
            comments: {
              some: {
                createdAt: {
                  gte: thirtyDaysAgo,
                },
              },
            },
          },
          {
            postLikes: {
              some: {
                createdAt: {
                  gte: thirtyDaysAgo,
                },
              },
            },
          },
          {
            affirmations: {
              some: {
                seenAt: {
                  gte: thirtyDaysAgo,
                },
              },
            },
          },
        ],
      },
    });
  }

  // Get new users this month
  async getNewUsersThisMonth() {
    const startOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    );

    return prisma.user.count({
      where: {
        createdAt: {
          gte: startOfMonth,
        },
      },
    });
  }

  // Get subscription statistics
  async getSubscriptionStatistics() {
    const now = new Date();

    const [
      totalSubscriptions,
      activeSubscriptions,
      monthlySubscriptions,
      yearlySubscriptions,
    ] = await Promise.all([
      prisma.subscription.count(),
      prisma.subscription.count({
        where: {
          isActive: true,
          endDate: {
            gt: now,
          },
        },
      }),
      prisma.subscription.count({
        where: {
          plan: "monthly",
          isActive: true,
          endDate: {
            gt: now,
          },
        },
      }),
      prisma.subscription.count({
        where: {
          plan: "yearly",
          isActive: true,
          endDate: {
            gt: now,
          },
        },
      }),
    ]);

    const monthlyRevenue = monthlySubscriptions * 9.99;
    const yearlyRevenue = yearlySubscriptions * 99.99;

    return {
      total: totalSubscriptions,
      active: activeSubscriptions,
      monthly: monthlySubscriptions,
      yearly: yearlySubscriptions,
      revenue: {
        monthly: monthlyRevenue,
        yearly: yearlyRevenue,
        total: monthlyRevenue + yearlyRevenue,
      },
    };
  }
}

module.exports = new AnalyticsService();
