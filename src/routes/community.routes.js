const express = require("express");
const router = express.Router();
const communityController = require("../controllers/community.controller");
const { authenticate, authorizeRoles } = require("../middleware/auth");

/**
 * @swagger
 * tags:
 *   name: Community
 *   description: API for managing communities and community interactions
 */

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * @swagger
 * /community:
 *   post:
 *     summary: Create a new community
 *     tags: [Community]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               isPrivate:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Community created successfully
 */
router.post("/", communityController.createCommunity);

/**
 * @swagger
 * /community:
 *   get:
 *     summary: Get all communities
 *     tags: [Community]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of communities
 */
router.get("/", communityController.getAllCommunities);

/**
 * @swagger
 * /community/{id}:
 *   get:
 *     summary: Get a community by ID
 *     tags: [Community]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Community data
 */
router.get("/:id", communityController.getCommunityById);

/**
 * @swagger
 * /community/{id}:
 *   put:
 *     summary: Update a community
 *     tags: [Community]
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
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               isPrivate:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Community updated successfully
 */
router.put("/:id", communityController.updateCommunity);

/**
 * @swagger
 * /community/{id}:
 *   delete:
 *     summary: Delete a community
 *     tags: [Community]
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
 *         description: Community deleted successfully
 */
router.delete("/:id", communityController.deleteCommunity);

/**
 * @swagger
 * /community/{communityId}/join:
 *   post:
 *     summary: Join a community
 *     tags: [Community]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: communityId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Successfully joined the community
 */
router.post("/:communityId/join", communityController.joinCommunity);

/**
 * @swagger
 * /community/{communityId}/members:
 *   post:
 *     summary: Add a member to a community (Admin/Creator only)
 *     tags: [Community]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: communityId
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
 *               userId:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [ADMIN, MODERATOR, MEMBER]
 *     responses:
 *       201:
 *         description: Member added successfully
 */
router.post(
  "/:communityId/members",
  authorizeRoles("ADMIN"),
  communityController.addMember
);

/**
 * @swagger
 * /community/{communityId}/members/{userId}:
 *   delete:
 *     summary: Remove a member from a community (Admin/Creator only)
 *     tags: [Community]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: communityId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Member removed successfully
 */
router.delete(
  "/:communityId/members/:userId",
  authorizeRoles("ADMIN"),
  communityController.removeMember
);

/**
 * @swagger
 * /community/{communityId}/members/{userId}/role:
 *   put:
 *     summary: Update a member's role (Admin/Creator only)
 *     tags: [Community]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: communityId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
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
 *               role:
 *                 type: string
 *                 enum: [ADMIN, MODERATOR, MEMBER]
 *     responses:
 *       200:
 *         description: Member role updated successfully
 */
router.put(
  "/:communityId/members/:userId/role",
  authorizeRoles("ADMIN"),
  communityController.updateMemberRole
);

/**
 * @swagger
 * /community/{communityId}/members:
 *   get:
 *     summary: Get all members of a community
 *     tags: [Community]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: communityId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of community members
 */
router.get("/:communityId/members", communityController.getCommunityMembers);

/**
 * @swagger
 * /community/{communityId}/posts:
 *   post:
 *     summary: Create a new post in a community
 *     tags: [Community]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: communityId
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
 *               postType:
 *                 type: string
 *                 enum: [TEXT, IMAGE, VIDEO]
 *               categoryId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Post created successfully
 */
router.post("/:communityId/posts", communityController.createCommunityPost);

/**
 * @swagger
 * /community/{communityId}/posts:
 *   get:
 *     summary: Get all posts in a community
 *     tags: [Community]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: communityId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of community posts
 */
router.get("/:communityId/posts", communityController.getCommunityPosts);

/**
 * @swagger
 * /community/posts/{id}:
 *   put:
 *     summary: Update a community post
 *     tags: [Community]
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
 *     responses:
 *       200:
 *         description: Post updated successfully
 */
router.put("/posts/:id", communityController.updateCommunityPost);

/**
 * @swagger
 * /community/posts/{id}:
 *   delete:
 *     summary: Delete a community post
 *     tags: [Community]
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
router.delete("/posts/:id", communityController.deleteCommunityPost);

module.exports = router;
