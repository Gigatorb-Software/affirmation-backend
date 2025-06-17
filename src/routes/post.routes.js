const express = require("express");
const router = express.Router();
const postController = require("../controllers/post.controller");
const { authenticate, authorizeRoles } = require("../middleware/auth");

// Create a new post
router.post("/create", authenticate, postController.createPost);

// Get a specific post
router.get("/:id", postController.getPost);

// Update a post
router.put("/:id", authenticate, postController.updatePost);

// Delete a post
router.delete("/:id", authenticate, postController.deletePost);

// Get all posts by a user
router.get("/user/:userId", postController.getUserPosts);

// Admin routes
router.get(
  "/admin/all",
  authenticate,
  authorizeRoles("ADMIN"),
  postController.getAllPosts
);
router.delete(
  "/admin/:id",
  authenticate,
  authorizeRoles("ADMIN"),
  postController.adminDeletePost
);

module.exports = router;
