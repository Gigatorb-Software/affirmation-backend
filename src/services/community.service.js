const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class CommunityService {
  // Create a new community
  async createCommunity(data) {
    // Check if community name is already taken
    const existingCommunity = await prisma.community.findUnique({
      where: { name: data.name },
    });

    if (existingCommunity) {
      throw new Error("Community name already exists");
    }

    return prisma.community.create({
      data: {
        name: data.name,
        description: data.description,
        createdById: data.createdById,
        isPrivate: data.isPrivate || false,
      },
      include: {
        createdBy: true,
        members: true,
      },
    });
  }

  // Get all communities
  async getAllCommunities() {
    return prisma.community.findMany({
      include: {
        createdBy: true,
        members: true,
        posts: true,
      },
    });
  }

  // Get community by ID
  async getCommunityById(id) {
    return prisma.community.findUnique({
      where: { id },
      include: {
        createdBy: true,
        members: {
          include: {
            user: true,
          },
        },
        posts: {
          include: {
            author: true,
            category: true,
          },
        },
      },
    });
  }

  // Update community
  async updateCommunity(id, data, userId, isAdmin) {
    const community = await prisma.community.findUnique({
      where: { id },
      include: {
        members: true,
      },
    });

    if (!community) {
      throw new Error("Community not found");
    }

    // Only creator or admin can update
    if (!isAdmin && community.createdById !== userId) {
      throw new Error("Not authorized to update this community");
    }

    return prisma.community.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        isPrivate: data.isPrivate,
      },
      include: {
        createdBy: true,
        members: true,
      },
    });
  }

  // Delete community
  async deleteCommunity(id, userId, isAdmin) {
    const community = await prisma.community.findUnique({
      where: { id },
    });

    if (!community) {
      throw new Error("Community not found");
    }

    // Only creator or admin can delete
    if (!isAdmin && community.createdById !== userId) {
      throw new Error("Not authorized to delete this community");
    }

    return prisma.community.delete({
      where: { id },
    });
  }

  // Join community
  async joinCommunity(communityId, userId) {
    // Check if user is already a member
    const existingMember = await prisma.communityMember.findUnique({
      where: {
        communityId_userId: {
          communityId,
          userId,
        },
      },
    });

    if (existingMember) {
      throw new Error("User is already a member of this community");
    }

    // Check if community exists
    const community = await prisma.community.findUnique({
      where: { id: communityId },
    });

    if (!community) {
      throw new Error("Community not found");
    }

    // Add user as a member with default MEMBER role
    return prisma.communityMember.create({
      data: {
        communityId,
        userId,
        role: "MEMBER",
      },
      include: {
        user: true,
        community: true,
      },
    });
  }

  // Add member to community (admin only)
  async addMember(communityId, userId, role = "MEMBER", adminId, isAdmin) {
    const community = await prisma.community.findUnique({
      where: { id: communityId },
      include: {
        members: true,
      },
    });

    if (!community) {
      throw new Error("Community not found");
    }

    // Only admin or community creator can add members
    if (!isAdmin && community.createdById !== adminId) {
      throw new Error("Not authorized to add members");
    }

    return prisma.communityMember.create({
      data: {
        communityId,
        userId,
        role,
      },
      include: {
        user: true,
        community: true,
      },
    });
  }

  // Remove member from community (admin only)
  async removeMember(communityId, userId, adminId, isAdmin) {
    const community = await prisma.community.findUnique({
      where: { id: communityId },
    });

    if (!community) {
      throw new Error("Community not found");
    }

    // Only admin or community creator can remove members
    if (!isAdmin && community.createdById !== adminId) {
      throw new Error("Not authorized to remove members");
    }

    return prisma.communityMember.delete({
      where: {
        communityId_userId: {
          communityId,
          userId,
        },
      },
    });
  }

  // Update member role (admin only)
  async updateMemberRole(communityId, userId, role, adminId, isAdmin) {
    const community = await prisma.community.findUnique({
      where: { id: communityId },
    });

    if (!community) {
      throw new Error("Community not found");
    }

    // Only admin or community creator can update roles
    if (!isAdmin && community.createdById !== adminId) {
      throw new Error("Not authorized to update member roles");
    }

    return prisma.communityMember.update({
      where: {
        communityId_userId: {
          communityId,
          userId,
        },
      },
      data: { role },
      include: {
        user: true,
      },
    });
  }

  // Get community members
  async getCommunityMembers(communityId) {
    return prisma.communityMember.findMany({
      where: { communityId },
      include: {
        user: true,
      },
    });
  }

  // Create community post
  async createCommunityPost(data) {
    return prisma.communityPost.create({
      data: {
        communityId: data.communityId,
        authorId: data.authorId,
        content: data.content,
        mediaUrl: data.mediaUrl,
        postType: data.postType,
        categoryId: data.categoryId,
      },
      include: {
        author: true,
        category: true,
      },
    });
  }

  // Get community posts
  async getCommunityPosts(communityId) {
    return prisma.communityPost.findMany({
      where: { communityId },
      include: {
        author: true,
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  // Update community post
  async updateCommunityPost(id, data, userId, isAdmin) {
    const post = await prisma.communityPost.findUnique({
      where: { id },
    });

    if (!post) {
      throw new Error("Post not found");
    }

    // Only author, admin, or community creator can update
    if (!isAdmin && post.authorId !== userId) {
      throw new Error("Not authorized to update this post");
    }

    return prisma.communityPost.update({
      where: { id },
      data: {
        content: data.content,
        mediaUrl: data.mediaUrl,
        categoryId: data.categoryId,
      },
      include: {
        author: true,
        category: true,
      },
    });
  }

  // Delete community post
  async deleteCommunityPost(id, userId, isAdmin) {
    const post = await prisma.communityPost.findUnique({
      where: { id },
    });

    if (!post) {
      throw new Error("Post not found");
    }

    // Only author, admin, or community creator can delete
    if (!isAdmin && post.authorId !== userId) {
      throw new Error("Not authorized to delete this post");
    }

    return prisma.communityPost.delete({
      where: { id },
    });
  }
}

module.exports = new CommunityService();
