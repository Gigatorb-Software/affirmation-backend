const express = require("express");
const router = express.Router();
const interactionController = require("../controllers/interaction.controller");
const { authenticate } = require("../middleware/auth");

// Like routes
router.post(
  "/posts/:postId/like",
  authenticate,
  interactionController.toggleLike
);
router.get("/posts/:postId/likes", interactionController.getPostLikes);

// Comment routes
router.post(
  "/posts/:postId/comments",
  authenticate,
  interactionController.createComment
);
router.get("/posts/:postId/comments", interactionController.getPostComments);
router.put(
  "/comments/:commentId",
  authenticate,
  interactionController.updateComment
);
router.delete(
  "/comments/:commentId",
  authenticate,
  interactionController.deleteComment
);

module.exports = router;
