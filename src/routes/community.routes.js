const express = require("express");
const router = express.Router();
const communityController = require("../controllers/community.controller");
const { authenticate, authorizeRoles } = require("../middleware/auth");

// Apply authentication middleware to all routes
router.use(authenticate);

// Community CRUD routes
router.post("/", communityController.createCommunity);
router.get("/", communityController.getAllCommunities);
router.get("/:id", communityController.getCommunityById);
router.put("/:id", communityController.updateCommunity);
router.delete("/:id", communityController.deleteCommunity);

// Join community route
router.post("/:communityId/join", communityController.joinCommunity);

// Member management routes
router.post(
  "/:communityId/members",
  authorizeRoles("ADMIN"),
  communityController.addMember
);
router.delete(
  "/:communityId/members/:userId",
  authorizeRoles("ADMIN"),
  communityController.removeMember
);
router.put(
  "/:communityId/members/:userId/role",
  authorizeRoles("ADMIN"),
  communityController.updateMemberRole
);
router.get("/:communityId/members", communityController.getCommunityMembers);

// Community post routes
router.post("/:communityId/posts", communityController.createCommunityPost);
router.get("/:communityId/posts", communityController.getCommunityPosts);
router.put("/posts/:id", communityController.updateCommunityPost);
router.delete("/posts/:id", communityController.deleteCommunityPost);

module.exports = router;
