const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class UserCategoryPreferenceService {
  // Get all category preferences for a user
  async getUserCategoryPreferences(userId) {
    try {
      const preferences = await prisma.userCategoryPreference.findMany({
        where: { userId },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              description: true,
              isPremium: true,
            },
          },
        },
        orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      });
      return { success: true, data: preferences };
    } catch (error) {
      console.error("Error getting user category preferences:", error);
      return { success: false, error: error.message };
    }
  }

  // Get a specific category preference for a user
  async getUserCategoryPreference(userId, categoryId) {
    try {
      const preference = await prisma.userCategoryPreference.findUnique({
        where: {
          userId_categoryId: {
            userId,
            categoryId,
          },
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              description: true,
              isPremium: true,
            },
          },
        },
      });
      return { success: true, data: preference };
    } catch (error) {
      console.error("Error getting user category preference:", error);
      return { success: false, error: error.message };
    }
  }

  // Create or update a category preference for a user
  async createOrUpdateUserCategoryPreference(
    userId,
    categoryId,
    preferenceData
  ) {
    try {
      const { isPreferred = true, priority = 0 } = preferenceData;

      // Check if category exists
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
      });

      if (!category) {
        return { success: false, error: "Category not found" };
      }

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return { success: false, error: "User not found" };
      }

      const preference = await prisma.userCategoryPreference.upsert({
        where: {
          userId_categoryId: {
            userId,
            categoryId,
          },
        },
        update: {
          isPreferred,
          priority,
          updatedAt: new Date(),
        },
        create: {
          userId,
          categoryId,
          isPreferred,
          priority,
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              description: true,
              isPremium: true,
            },
          },
        },
      });

      return { success: true, data: preference };
    } catch (error) {
      console.error("Error creating/updating user category preference:", error);
      return { success: false, error: error.message };
    }
  }

  // Update multiple category preferences for a user
  async updateUserCategoryPreferences(userId, preferences) {
    try {
      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return { success: false, error: "User not found" };
      }

      // Validate all categories exist
      const categoryIds = preferences.map((p) => p.categoryId);
      const categories = await prisma.category.findMany({
        where: { id: { in: categoryIds } },
      });

      if (categories.length !== categoryIds.length) {
        return { success: false, error: "One or more categories not found" };
      }

      // Use transaction to update all preferences
      const result = await prisma.$transaction(async (tx) => {
        const updatedPreferences = [];

        for (const preference of preferences) {
          const { categoryId, isPreferred = true, priority = 0 } = preference;

          const updatedPreference = await tx.userCategoryPreference.upsert({
            where: {
              userId_categoryId: {
                userId,
                categoryId,
              },
            },
            update: {
              isPreferred,
              priority,
              updatedAt: new Date(),
            },
            create: {
              userId,
              categoryId,
              isPreferred,
              priority,
            },
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                  isPremium: true,
                },
              },
            },
          });

          updatedPreferences.push(updatedPreference);
        }

        return updatedPreferences;
      });

      return { success: true, data: result };
    } catch (error) {
      console.error("Error updating user category preferences:", error);
      return { success: false, error: error.message };
    }
  }

  // Delete a category preference for a user
  async deleteUserCategoryPreference(userId, categoryId) {
    try {
      const preference = await prisma.userCategoryPreference.delete({
        where: {
          userId_categoryId: {
            userId,
            categoryId,
          },
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              description: true,
              isPremium: true,
            },
          },
        },
      });

      return { success: true, data: preference };
    } catch (error) {
      console.error("Error deleting user category preference:", error);
      return { success: false, error: error.message };
    }
  }

  // Delete all category preferences for a user
  async deleteAllUserCategoryPreferences(userId) {
    try {
      const result = await prisma.userCategoryPreference.deleteMany({
        where: { userId },
      });

      return { success: true, data: { deletedCount: result.count } };
    } catch (error) {
      console.error("Error deleting all user category preferences:", error);
      return { success: false, error: error.message };
    }
  }

  // Get categories that a user prefers
  async getUserPreferredCategories(userId) {
    try {
      const preferences = await prisma.userCategoryPreference.findMany({
        where: {
          userId,
          isPreferred: true,
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              description: true,
              isPremium: true,
            },
          },
        },
        orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      });

      const categories = preferences.map((p) => p.category);
      return { success: true, data: categories };
    } catch (error) {
      console.error("Error getting user preferred categories:", error);
      return { success: false, error: error.message };
    }
  }

  // Get all available categories with user preference status
  async getCategoriesWithUserPreferences(userId) {
    try {
      const categories = await prisma.category.findMany({
        include: {
          userPreferences: {
            where: { userId },
            select: {
              isPreferred: true,
              priority: true,
            },
          },
        },
        orderBy: { name: "asc" },
      });

      const categoriesWithPreferences = categories.map((category) => ({
        ...category,
        userPreference: category.userPreferences[0] || null,
      }));

      return { success: true, data: categoriesWithPreferences };
    } catch (error) {
      console.error("Error getting categories with user preferences:", error);
      return { success: false, error: error.message };
    }
  }

  // Update category preferences with array of category IDs and isPreferred status
  async updateCategoryPreferences(userId, categoryIds, isPreferred) {
    try {
      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return { success: false, error: "User not found" };
      }

      // Validate all categories exist
      const categories = await prisma.category.findMany({
        where: { id: { in: categoryIds } },
      });

      if (categories.length !== categoryIds.length) {
        return { success: false, error: "One or more categories not found" };
      }

      // Use transaction to update all preferences
      const result = await prisma.$transaction(async (tx) => {
        const updatedPreferences = [];

        for (const categoryId of categoryIds) {
          const updatedPreference = await tx.userCategoryPreference.upsert({
            where: {
              userId_categoryId: {
                userId,
                categoryId,
              },
            },
            update: {
              isPreferred,
              updatedAt: new Date(),
            },
            create: {
              userId,
              categoryId,
              isPreferred,
              priority: 0,
            },
          });

          updatedPreferences.push(updatedPreference);
        }

        return updatedPreferences;
      });

      return {
        success: true,
        data: {
          updatedCount: result.length,
          updatedPreferences: result,
        },
      };
    } catch (error) {
      console.error("Error updating category preferences:", error);
      return { success: false, error: error.message };
    }
  }

  // Get all categories with user preference status (simplified version)
  async getAllCategoriesWithPreferences(userId) {
    try {
      const categories = await prisma.category.findMany({
        orderBy: { name: "asc" },
      });

      // Get user preferences for all categories
      const userPreferences = await prisma.userCategoryPreference.findMany({
        where: { userId },
        select: {
          categoryId: true,
          isPreferred: true,
        },
      });

      // Create a map for quick lookup
      const preferenceMap = new Map();
      userPreferences.forEach((pref) => {
        preferenceMap.set(pref.categoryId, pref.isPreferred);
      });

      // Add isPreferred status to each category
      const categoriesWithPreferences = categories.map((category) => ({
        id: category.id,
        name: category.name,
        description: category.description,
        isPremium: category.isPremium,
        isPreferred: preferenceMap.get(category.id) || false,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      }));

      return { success: true, data: categoriesWithPreferences };
    } catch (error) {
      console.error("Error getting all categories with preferences:", error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new UserCategoryPreferenceService();
