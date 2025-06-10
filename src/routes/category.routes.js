const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/category.controller");
const { authenticate, authorizeRoles } = require("../middleware/auth");

// Public routes
router.get("/", categoryController.getAllCategories);
router.get("/:id", categoryController.getCategory);

// Admin only routes
router.post(
  "/create",
  authenticate,
  // authorizeRoles("ADMIN"),
  categoryController.createCategory
);
router.put(
  "/:id",
  authenticate,
  // authorizeRoles("ADMIN"),
  categoryController.updateCategory
);
router.delete(
  "/:id",
  authenticate,
  // authorizeRoles("ADMIN"),
  categoryController.deleteCategory
);

module.exports = router;
