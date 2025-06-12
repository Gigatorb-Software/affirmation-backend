const communityService = require("../services/community.service");

class CommunityController {
  // Community CRUD operations
  async createCommunity(req, res) {
    try {
      const community = await communityService.createCommunity({
        ...req.body,
        createdById: req.user.id,
      });
      res.status(201).json(community);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAllCommunities(req, res) {
    try {
      const communities = await communityService.getAllCommunities();
      res.json(communities);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getCommunityById(req, res) {
    try {
      const community = await communityService.getCommunityById(req.params.id);
      if (!community) {
        return res.status(404).json({ error: "Community not found" });
      }
      res.json(community);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateCommunity(req, res) {
    try {
      const community = await communityService.updateCommunity(
        req.params.id,
        req.body,
        req.user.id,
        req.user.isAdmin
      );
      res.json(community);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteCommunity(req, res) {
    try {
      await communityService.deleteCommunity(
        req.params.id,
        req.user.id,
        req.user.isAdmin
      );
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Join community
  async joinCommunity(req, res) {
    try {
      const member = await communityService.joinCommunity(
        req.params.communityId,
        req.user.id
      );
      res.status(201).json({
        message: "Successfully joined the community",
        member,
      });
    } catch (error) {
      if (error.message === "User is already a member of this community") {
        return res.status(400).json({ error: error.message });
      }
      if (error.message === "Community not found") {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }

  // Member management operations
  async addMember(req, res) {
    try {
      const member = await communityService.addMember(
        req.params.communityId,
        req.body.userId,
        req.body.role,
        req.user.id,
        req.user.isAdmin
      );
      res.status(201).json(member);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async removeMember(req, res) {
    try {
      await communityService.removeMember(
        req.params.communityId,
        req.params.userId,
        req.user.id,
        req.user.isAdmin
      );
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateMemberRole(req, res) {
    try {
      const member = await communityService.updateMemberRole(
        req.params.communityId,
        req.params.userId,
        req.body.role,
        req.user.id,
        req.user.isAdmin
      );
      res.json(member);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getCommunityMembers(req, res) {
    try {
      const members = await communityService.getCommunityMembers(
        req.params.communityId
      );
      res.json(members);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Community post operations
  async createCommunityPost(req, res) {
    try {
      const post = await communityService.createCommunityPost({
        ...req.body,
        authorId: req.user.id,
      });
      res.status(201).json(post);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getCommunityPosts(req, res) {
    try {
      const posts = await communityService.getCommunityPosts(
        req.params.communityId
      );
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateCommunityPost(req, res) {
    try {
      const post = await communityService.updateCommunityPost(
        req.params.id,
        req.body,
        req.user.id,
        req.user.isAdmin
      );
      res.json(post);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteCommunityPost(req, res) {
    try {
      await communityService.deleteCommunityPost(
        req.params.id,
        req.user.id,
        req.user.isAdmin
      );
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new CommunityController();
