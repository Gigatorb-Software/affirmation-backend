const express = require("express");
const router = express.Router();
const interactionController = require("../controllers/interaction.controller");
const { authenticate } = require("../middleware/auth");

/**
 * @swagger
 * tags:
 *   name: Interactions
 *   description: API for managing post likes and comments
 */

// Like routes
router.use(authenticate);

/**
 * @swagger
 * /interaction/post/{postId}/like:
 *   post:
 *     summary: Like or unlike a post
 *     tags: [Interactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Post liked/unliked successfully
 */
router.post("/post/:postId/like", interactionController.toggleLike);

router.get("/posts/:postId/likes", interactionController.getPostLikes);

// Comment routes
/**
 * @swagger
 * /interaction/post/{postId}/comment:
 *   post:
 *     summary: Comment on a post
 *     tags: [Interactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment created successfully
 */
router.post("/post/:postId/comment", interactionController.createComment);

router.get("/posts/:postId/comments", interactionController.getPostComments);

/**
 * @swagger
 * /interaction/comment/{commentId}:
 *   put:
 *     summary: Update a comment
 *     tags: [Interactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comment updated successfully
 */
router.put("/comment/:commentId", interactionController.updateComment);

/**
 * @swagger
 * /interaction/comment/{commentId}:
 *   delete:
 *     summary: Delete a comment
 *     tags: [Interactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Comment deleted successfully
 */
router.delete("/comment/:commentId", interactionController.deleteComment);

module.exports = router;
