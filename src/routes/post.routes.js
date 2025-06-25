const express = require("express");
const router = express.Router();
const postController = require("../controllers/post.controller");
const { authenticate, authorizeRoles } = require("../middleware/auth");

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: API for managing user posts
 */

/**
 * @swagger
 * /post/create:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *               mediaUrl:
 *                 type: string
 *               postType:
 *                 type: string
 *                 enum: [TEXT, IMAGE, VIDEO]
 *               categoryId:
 *                 type: string
 *               privacy:
 *                 type: string
 *                 enum: [PUBLIC, PRIVATE]
 *     responses:
 *       201:
 *         description: Post created successfully
 */
router.post("/create", authenticate, postController.createPost);

/**
 * @swagger
 * /post/{id}:
 *   get:
 *     summary: Get a specific post by ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post data
 */
router.get("/:id", postController.getPost);

/**
 * @swagger
 * /post/{id}:
 *   put:
 *     summary: Update a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               mediaUrl:
 *                 type: string
 *               categoryId:
 *                 type: string
 *               privacy:
 *                 type: string
 *                 enum: [PUBLIC, PRIVATE]
 *     responses:
 *       200:
 *         description: Post updated successfully
 */
router.put("/:id", authenticate, postController.updatePost);

/**
 * @swagger
 * /post/{id}:
 *   delete:
 *     summary: Delete a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Post deleted successfully
 */
router.delete("/:id", authenticate, postController.deletePost);

/**
 * @swagger
 * /post/user/{userId}:
 *   get:
 *     summary: Get all posts by a user
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of posts by the user
 */
router.get("/user/:userId", postController.getUserPosts);

/**
 * @swagger
 * /post/admin/all:
 *   get:
 *     summary: Get all posts (Admin only)
 *     tags: [Posts, Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of all posts
 */
router.get(
  "/admin/all",
  authenticate,
  // authorizeRoles("ADMIN"),
  postController.getAllPosts
);

/**
 * @swagger
 * /post/admin/{id}:
 *   delete:
 *     summary: Delete a post (Admin only)
 *     tags: [Posts, Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Post deleted successfully
 */
router.delete(
  "/admin/:id",
  authenticate,
  authorizeRoles("ADMIN"),
  postController.adminDeletePost
);

module.exports = router;
