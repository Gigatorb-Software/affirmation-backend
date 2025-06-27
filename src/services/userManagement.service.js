const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new PrismaClient();

class UserManagementService {
  // Get all users with pagination and filtering
  async getAllUsers(page = 1, limit = 10, search = "", filters = {}) {
    const skip = (page - 1) * limit;

    const whereClause = {
      AND: [
        ...(search
          ? [
              {
                OR: [
                  { firstName: { contains: search } },
                  { lastName: { contains: search } },
                  { username: { contains: search } },
                  { email: { contains: search } },
                ],
              },
            ]
          : []),
        ...(filters.isAdmin !== undefined
          ? [{ isAdmin: filters.isAdmin }]
          : []),
        ...(filters.gender ? [{ gender: filters.gender }] : []),
        ...(filters.hasSubscription !== undefined
          ? [
              filters.hasSubscription
                ? { subscription: { isNot: null } }
                : { subscription: null },
            ]
          : []),
      ],
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true,
          email: true,
          phone: true,
          gender: true,
          dob: true,
          isAdmin: true,
          fcmToken: true,
          subscription: {
            select: {
              plan: true,
              isActive: true,
              startDate: true,
              endDate: true,
            },
          },
          _count: {
            select: {
              posts: true,
              comments: true,
              communities: true,
              createdCommunities: true,
              affirmations: true,
              goals: true,
            },
          },
          createdAt: true,
          updatedAt: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where: whereClause }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get user by ID with detailed information
  async getUserById(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        email: true,
        phone: true,
        gender: true,
        dob: true,
        isAdmin: true,
        fcmToken: true,
        subscription: {
          select: {
            id: true,
            plan: true,
            isActive: true,
            startDate: true,
            endDate: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        posts: {
          select: {
            id: true,
            content: true,
            postType: true,
            privacy: true,
            createdAt: true,
            _count: {
              select: {
                likes: true,
                comments: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        communities: {
          select: {
            role: true,
            joinedAt: true,
            community: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
        createdCommunities: {
          select: {
            id: true,
            name: true,
            description: true,
            isPrivate: true,
            createdAt: true,
            _count: {
              select: {
                members: true,
                posts: true,
              },
            },
          },
        },
        affirmations: {
          select: {
            id: true,
            seenAt: true,
            isCompleted: true,
            affirmation: {
              select: {
                id: true,
                content: true,
                category: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: { seenAt: "desc" },
          take: 10,
        },
        goals: {
          select: {
            id: true,
            title: true,
            status: true,
            progress: true,
            startDate: true,
            targetDate: true,
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: {
          select: {
            posts: true,
            comments: true,
            postLikes: true,
            communities: true,
            createdCommunities: true,
            affirmations: true,
            goals: true,
            notifications: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  // Create new user (admin only)
  async createUser(userData) {
    // Check if email or username already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: userData.email }, { username: userData.username }],
      },
    });

    if (existingUser) {
      throw new Error("Email or username already exists");
    }

    // Hash password if provided
    let hashedPassword = null;
    if (userData.password) {
      hashedPassword = await bcrypt.hash(userData.password, 12);
    }

    const user = await prisma.user.create({
      data: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        phone: userData.phone,
        gender: userData.gender,
        dob: new Date(userData.dob),
        isAdmin: userData.isAdmin || false,
        fcmToken: userData.fcmToken,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        email: true,
        phone: true,
        gender: true,
        dob: true,
        isAdmin: true,
        fcmToken: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  // Update user (admin only)
  async updateUser(userId, updateData) {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new Error("User not found");
    }

    // Check if email or username conflicts with other users
    if (updateData.email || updateData.username) {
      const conflictingUser = await prisma.user.findFirst({
        where: {
          OR: [
            ...(updateData.email ? [{ email: updateData.email }] : []),
            ...(updateData.username ? [{ username: updateData.username }] : []),
          ],
          NOT: { id: userId },
        },
      });

      if (conflictingUser) {
        throw new Error("Email or username already exists");
      }
    }

    // Hash password if provided
    let hashedPassword = undefined;
    if (updateData.password) {
      hashedPassword = await bcrypt.hash(updateData.password, 12);
    }

    const updateFields = {
      ...(updateData.firstName !== undefined && {
        firstName: updateData.firstName,
      }),
      ...(updateData.lastName !== undefined && {
        lastName: updateData.lastName,
      }),
      ...(updateData.username !== undefined && {
        username: updateData.username,
      }),
      ...(updateData.email !== undefined && { email: updateData.email }),
      ...(hashedPassword && { password: hashedPassword }),
      ...(updateData.phone !== undefined && { phone: updateData.phone }),
      ...(updateData.gender !== undefined && { gender: updateData.gender }),
      ...(updateData.dob !== undefined && { dob: new Date(updateData.dob) }),
      ...(updateData.isAdmin !== undefined && { isAdmin: updateData.isAdmin }),
      ...(updateData.fcmToken !== undefined && {
        fcmToken: updateData.fcmToken,
      }),
    };

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateFields,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        email: true,
        phone: true,
        gender: true,
        dob: true,
        isAdmin: true,
        fcmToken: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  // Delete user (admin only)
  async deleteUser(userId) {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new Error("User not found");
    }

    // Delete user and all related data
    await prisma.user.delete({
      where: { id: userId },
    });

    return { message: "User deleted successfully" };
  }

  // Toggle admin status
  async toggleAdminStatus(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isAdmin: !user.isAdmin },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        email: true,
        isAdmin: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  // Get user statistics
  async getUserStatistics() {
    const [
      totalUsers,
      adminUsers,
      usersWithSubscription,
      activeUsers,
      newUsersThisMonth,
      genderDistribution,
      subscriptionStats,
    ] = await Promise.all([
      // Total users
      prisma.user.count(),

      // Admin users
      prisma.user.count({ where: { isAdmin: true } }),

      // Users with subscription
      prisma.user.count({
        where: { subscription: { isNot: null } },
      }),

      // Active users (users with activity in last 30 days)
      prisma.user.count({
        where: {
          OR: [
            {
              posts: {
                some: {
                  createdAt: {
                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                  },
                },
              },
            },
            {
              comments: {
                some: {
                  createdAt: {
                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                  },
                },
              },
            },
            {
              postLikes: {
                some: {
                  createdAt: {
                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                  },
                },
              },
            },
            {
              affirmations: {
                some: {
                  seenAt: {
                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                  },
                },
              },
            },
          ],
        },
      }),

      // New users this month
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),

      // Gender distribution
      prisma.user.groupBy({
        by: ["gender"],
        _count: { gender: true },
      }),

      // Subscription statistics
      prisma.subscription.groupBy({
        by: ["plan"],
        _count: { plan: true },
        where: { isActive: true },
      }),
    ]);

    return {
      totalUsers,
      adminUsers,
      regularUsers: totalUsers - adminUsers,
      usersWithSubscription,
      usersWithoutSubscription: totalUsers - usersWithSubscription,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      newUsersThisMonth,
      genderDistribution: genderDistribution.reduce((acc, item) => {
        acc[item.gender || "Not specified"] = item._count.gender;
        return acc;
      }, {}),
      subscriptionStats: subscriptionStats.reduce((acc, item) => {
        acc[item.plan] = item._count.plan;
        return acc;
      }, {}),
    };
  }

  // Get user activity logs
  async getUserActivity(userId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [posts, comments, likes, affirmations, goals] = await Promise.all([
      prisma.post.findMany({
        where: { authorId: userId },
        select: {
          id: true,
          content: true,
          postType: true,
          createdAt: true,
          _count: { likes: true, comments: true },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),

      prisma.comment.findMany({
        where: { authorId: userId },
        select: {
          id: true,
          content: true,
          createdAt: true,
          post: { select: { id: true, content: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),

      prisma.postLike.findMany({
        where: { userId },
        select: {
          id: true,
          createdAt: true,
          post: { select: { id: true, content: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),

      prisma.affirmationHistory.findMany({
        where: { userId },
        select: {
          id: true,
          seenAt: true,
          isCompleted: true,
          affirmation: { select: { content: true } },
        },
        orderBy: { seenAt: "desc" },
        skip,
        take: limit,
      }),

      prisma.goal.findMany({
        where: { userId },
        select: {
          id: true,
          title: true,
          status: true,
          progress: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
      }),
    ]);

    return {
      posts,
      comments,
      likes,
      affirmations,
      goals,
    };
  }

  // Bulk operations
  async bulkUpdateUsers(userIds, updateData) {
    const updateFields = {
      ...(updateData.isAdmin !== undefined && { isAdmin: updateData.isAdmin }),
      ...(updateData.gender !== undefined && { gender: updateData.gender }),
    };

    const result = await prisma.user.updateMany({
      where: { id: { in: userIds } },
      data: updateFields,
    });

    return {
      message: `Updated ${result.count} users`,
      updatedCount: result.count,
    };
  }

  async bulkDeleteUsers(userIds) {
    const result = await prisma.user.deleteMany({
      where: { id: { in: userIds } },
    });

    return {
      message: `Deleted ${result.count} users`,
      deletedCount: result.count,
    };
  }

  // Get all users with public information only (for regular users)
  async getAllPublicUsers(page = 1, limit = 10, search = "", filters = {}) {
    const skip = (page - 1) * limit;

    const whereClause = {
      AND: [
        ...(search
          ? [
              {
                OR: [
                  { firstName: { contains: search } },
                  { lastName: { contains: search } },
                  { username: { contains: search } },
                ],
              },
            ]
          : []),
        ...(filters.gender ? [{ gender: filters.gender }] : []),
      ],
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true,
          gender: true,
          _count: {
            select: {
              posts: true,
              comments: true,
              communities: true,
              createdCommunities: true,
            },
          },
          createdAt: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where: whereClause }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get public user profile by ID (for regular users)
  async getPublicUserById(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        gender: true,
        posts: {
          where: { privacy: "PUBLIC" },
          select: {
            id: true,
            content: true,
            postType: true,
            createdAt: true,
            _count: {
              select: {
                likes: true,
                comments: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        communities: {
          where: { community: { isPrivate: false } },
          select: {
            role: true,
            joinedAt: true,
            community: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
        createdCommunities: {
          where: { isPrivate: false },
          select: {
            id: true,
            name: true,
            description: true,
            createdAt: true,
            _count: {
              select: {
                members: true,
                posts: true,
              },
            },
          },
        },
        _count: {
          select: {
            posts: true,
            comments: true,
            communities: true,
            createdCommunities: true,
          },
        },
        createdAt: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  // Update current user's profile (for regular users)
  async updateCurrentUserProfile(userId, updateData) {
    // Only allow updating certain fields for regular users
    const allowedFields = [
      "firstName",
      "lastName",
      "username",
      "email",
      "phone",
      "gender",
      "dob",
      "fcmToken",
    ];

    const filteredUpdateData = {};
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredUpdateData[field] = updateData[field];
      }
    }

    // If password is being updated, hash it
    if (updateData.password) {
      filteredUpdateData.password = await bcrypt.hash(updateData.password, 10);
    }

    // Check for unique constraints
    if (filteredUpdateData.username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username: filteredUpdateData.username,
          id: { not: userId },
        },
      });
      if (existingUser) {
        throw new Error("Username already exists");
      }
    }

    if (filteredUpdateData.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: filteredUpdateData.email,
          id: { not: userId },
        },
      });
      if (existingUser) {
        throw new Error("Email already exists");
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: filteredUpdateData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        email: true,
        phone: true,
        gender: true,
        dob: true,
        fcmToken: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }
}

module.exports = new UserManagementService();
