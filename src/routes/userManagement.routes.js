const express = require("express");
const router = express.Router();
const userManagementController = require("../controllers/userManagement.controller");
const { authenticate, authorizeRoles } = require("../middleware/auth");

// Apply authentication and admin authorization to all routes
router.use(authenticate);
router.use(authorizeRoles("ADMIN"));

// User CRUD operations
router.get("/", userManagementController.getAllUsers);
router.get("/statistics", userManagementController.getUserStatistics);
router.get("/:userId", userManagementController.getUserById);
router.post("/", userManagementController.createUser);
router.put("/:userId", userManagementController.updateUser);
router.delete("/:userId", userManagementController.deleteUser);

// Admin-specific operations
router.patch(
  "/:userId/toggle-admin",
  userManagementController.toggleAdminStatus
);
router.get("/:userId/activity", userManagementController.getUserActivity);

// Bulk operations
router.post("/bulk-update", userManagementController.bulkUpdateUsers);
router.post("/bulk-delete", userManagementController.bulkDeleteUsers);

module.exports = router;
