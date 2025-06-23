const userManagementService = require("../services/userManagement.service");

class UserManagementController {
  // Get all users with pagination and filtering
  async getAllUsers(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search = "",
        isAdmin,
        gender,
        hasSubscription,
      } = req.query;

      const filters = {
        ...(isAdmin !== undefined && { isAdmin: isAdmin === "true" }),
        ...(gender && { gender }),
        ...(hasSubscription !== undefined && {
          hasSubscription: hasSubscription === "true",
        }),
      };

      const result = await userManagementService.getAllUsers(
        parseInt(page),
        parseInt(limit),
        search,
        filters
      );

      res.json({
        success: true,
        data: result.users,
        pagination: result.pagination,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Get user by ID with detailed information
  async getUserById(req, res) {
    try {
      const { userId } = req.params;
      const user = await userManagementService.getUserById(userId);

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      if (error.message === "User not found") {
        return res.status(404).json({
          success: false,
          error: error.message,
        });
      }
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Create new user
  async createUser(req, res) {
    try {
      const userData = req.body;

      // Validate required fields
      const requiredFields = ["firstName", "lastName", "username", "email"];
      for (const field of requiredFields) {
        if (!userData[field]) {
          return res.status(400).json({
            success: false,
            error: `${field} is required`,
          });
        }
      }

      const user = await userManagementService.createUser(userData);

      res.status(201).json({
        success: true,
        data: user,
        message: "User created successfully",
      });
    } catch (error) {
      if (error.message.includes("already exists")) {
        return res.status(400).json({
          success: false,
          error: error.message,
        });
      }
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Update user
  async updateUser(req, res) {
    try {
      const { userId } = req.params;
      const updateData = req.body;

      const user = await userManagementService.updateUser(userId, updateData);

      res.json({
        success: true,
        data: user,
        message: "User updated successfully",
      });
    } catch (error) {
      if (error.message === "User not found") {
        return res.status(404).json({
          success: false,
          error: error.message,
        });
      }
      if (error.message.includes("already exists")) {
        return res.status(400).json({
          success: false,
          error: error.message,
        });
      }
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Delete user
  async deleteUser(req, res) {
    try {
      const { userId } = req.params;
      const result = await userManagementService.deleteUser(userId);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      if (error.message === "User not found") {
        return res.status(404).json({
          success: false,
          error: error.message,
        });
      }
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Toggle admin status
  async toggleAdminStatus(req, res) {
    try {
      const { userId } = req.params;
      const user = await userManagementService.toggleAdminStatus(userId);

      res.json({
        success: true,
        data: user,
        message: `User ${
          user.isAdmin ? "promoted to" : "demoted from"
        } admin successfully`,
      });
    } catch (error) {
      if (error.message === "User not found") {
        return res.status(404).json({
          success: false,
          error: error.message,
        });
      }
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Get user statistics
  async getUserStatistics(req, res) {
    try {
      const statistics = await userManagementService.getUserStatistics();

      res.json({
        success: true,
        data: statistics,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Get user activity
  async getUserActivity(req, res) {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const activity = await userManagementService.getUserActivity(
        userId,
        parseInt(page),
        parseInt(limit)
      );

      res.json({
        success: true,
        data: activity,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Bulk update users
  async bulkUpdateUsers(req, res) {
    try {
      const { userIds, updateData } = req.body;

      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({
          success: false,
          error: "userIds array is required",
        });
      }

      const result = await userManagementService.bulkUpdateUsers(
        userIds,
        updateData
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Bulk delete users
  async bulkDeleteUsers(req, res) {
    try {
      const { userIds } = req.body;

      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({
          success: false,
          error: "userIds array is required",
        });
      }

      const result = await userManagementService.bulkDeleteUsers(userIds);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}

module.exports = new UserManagementController();
