const userCategoryPreferenceService = require("../services/userCategoryPreference.service");

class UserCategoryPreferenceController {
  // Get all category preferences for the authenticated user
  async getUserCategoryPreferences(req, res) {
    try {
      const userId = req.user.id;
      const result =
        await userCategoryPreferenceService.getUserCategoryPreferences(userId);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.error,
        });
      }

      return res.status(200).json({
        success: true,
        data: result.data,
        message: "User category preferences retrieved successfully",
      });
    } catch (error) {
      console.error("Error in getUserCategoryPreferences controller:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get a specific category preference for the authenticated user
  async getUserCategoryPreference(req, res) {
    try {
      const userId = req.user.id;
      const { categoryId } = req.params;

      if (!categoryId) {
        return res.status(400).json({
          success: false,
          message: "Category ID is required",
        });
      }

      const result =
        await userCategoryPreferenceService.getUserCategoryPreference(
          userId,
          categoryId
        );

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.error,
        });
      }

      return res.status(200).json({
        success: true,
        data: result.data,
        message: "User category preference retrieved successfully",
      });
    } catch (error) {
      console.error("Error in getUserCategoryPreference controller:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Create or update a category preference for the authenticated user
  async createOrUpdateUserCategoryPreference(req, res) {
    try {
      const userId = req.user.id;
      const { categoryId } = req.params;
      const { isPreferred, priority } = req.body;

      if (!categoryId) {
        return res.status(400).json({
          success: false,
          message: "Category ID is required",
        });
      }

      const preferenceData = {
        isPreferred: isPreferred !== undefined ? isPreferred : true,
        priority: priority !== undefined ? priority : 0,
      };

      const result =
        await userCategoryPreferenceService.createOrUpdateUserCategoryPreference(
          userId,
          categoryId,
          preferenceData
        );

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.error,
        });
      }

      return res.status(200).json({
        success: true,
        data: result.data,
        message: "User category preference created/updated successfully",
      });
    } catch (error) {
      console.error(
        "Error in createOrUpdateUserCategoryPreference controller:",
        error
      );
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Update multiple category preferences for the authenticated user
  async updateUserCategoryPreferences(req, res) {
    try {
      const userId = req.user.id;
      const { preferences } = req.body;

      if (!preferences || !Array.isArray(preferences)) {
        return res.status(400).json({
          success: false,
          message: "Preferences array is required",
        });
      }

      if (preferences.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Preferences array cannot be empty",
        });
      }

      // Validate each preference has required fields
      for (const preference of preferences) {
        if (!preference.categoryId) {
          return res.status(400).json({
            success: false,
            message: "Category ID is required for each preference",
          });
        }
      }

      const result =
        await userCategoryPreferenceService.updateUserCategoryPreferences(
          userId,
          preferences
        );

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.error,
        });
      }

      return res.status(200).json({
        success: true,
        data: result.data,
        message: "User category preferences updated successfully",
      });
    } catch (error) {
      console.error(
        "Error in updateUserCategoryPreferences controller:",
        error
      );
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Delete a category preference for the authenticated user
  async deleteUserCategoryPreference(req, res) {
    try {
      const userId = req.user.id;
      const { categoryId } = req.params;

      if (!categoryId) {
        return res.status(400).json({
          success: false,
          message: "Category ID is required",
        });
      }

      const result =
        await userCategoryPreferenceService.deleteUserCategoryPreference(
          userId,
          categoryId
        );

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.error,
        });
      }

      return res.status(200).json({
        success: true,
        data: result.data,
        message: "User category preference deleted successfully",
      });
    } catch (error) {
      console.error("Error in deleteUserCategoryPreference controller:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Delete all category preferences for the authenticated user
  async deleteAllUserCategoryPreferences(req, res) {
    try {
      const userId = req.user.id;
      const result =
        await userCategoryPreferenceService.deleteAllUserCategoryPreferences(
          userId
        );

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.error,
        });
      }

      return res.status(200).json({
        success: true,
        data: result.data,
        message: "All user category preferences deleted successfully",
      });
    } catch (error) {
      console.error(
        "Error in deleteAllUserCategoryPreferences controller:",
        error
      );
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get categories that the authenticated user prefers
  async getUserPreferredCategories(req, res) {
    try {
      const userId = req.user.id;
      const result =
        await userCategoryPreferenceService.getUserPreferredCategories(userId);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.error,
        });
      }

      return res.status(200).json({
        success: true,
        data: result.data,
        message: "User preferred categories retrieved successfully",
      });
    } catch (error) {
      console.error("Error in getUserPreferredCategories controller:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get all available categories with user preference status
  async getCategoriesWithUserPreferences(req, res) {
    try {
      const userId = req.user.id;
      const result =
        await userCategoryPreferenceService.getCategoriesWithUserPreferences(
          userId
        );

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.error,
        });
      }

      return res.status(200).json({
        success: true,
        data: result.data,
        message: "Categories with user preferences retrieved successfully",
      });
    } catch (error) {
      console.error(
        "Error in getCategoriesWithUserPreferences controller:",
        error
      );
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Admin: Get category preferences for any user
  async getAdminUserCategoryPreferences(req, res) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "User ID is required",
        });
      }

      // Check if the authenticated user is an admin
      if (!req.user.isAdmin) {
        return res.status(403).json({
          success: false,
          message: "Access denied. Admin privileges required.",
        });
      }

      const result =
        await userCategoryPreferenceService.getUserCategoryPreferences(userId);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.error,
        });
      }

      return res.status(200).json({
        success: true,
        data: result.data,
        message: "User category preferences retrieved successfully",
      });
    } catch (error) {
      console.error(
        "Error in getAdminUserCategoryPreferences controller:",
        error
      );
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Admin: Update category preferences for any user
  async updateAdminUserCategoryPreferences(req, res) {
    try {
      const { userId } = req.params;
      const { preferences } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "User ID is required",
        });
      }

      if (!preferences || !Array.isArray(preferences)) {
        return res.status(400).json({
          success: false,
          message: "Preferences array is required",
        });
      }

      // Check if the authenticated user is an admin
      if (!req.user.isAdmin) {
        return res.status(403).json({
          success: false,
          message: "Access denied. Admin privileges required.",
        });
      }

      const result =
        await userCategoryPreferenceService.updateUserCategoryPreferences(
          userId,
          preferences
        );

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.error,
        });
      }

      return res.status(200).json({
        success: true,
        data: result.data,
        message: "User category preferences updated successfully",
      });
    } catch (error) {
      console.error(
        "Error in updateAdminUserCategoryPreferences controller:",
        error
      );
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}

module.exports = new UserCategoryPreferenceController();
