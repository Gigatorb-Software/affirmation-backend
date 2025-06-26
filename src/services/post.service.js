const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.createPost = async ({
  authorId,
  content,
  mediaUrl,
  postType,
  categoryId,
  privacy,
  tags,
}) => {
  // Validate required fields
  if (!authorId || !postType) {
    throw new Error("Author ID and post type are required");
  }

  // Validate post type
  if (!["TEXT", "IMAGE", "VIDEO"].includes(postType)) {
    throw new Error("Invalid post type");
  }

  // Validate privacy
  if (!["PUBLIC", "PRIVATE"].includes(privacy)) {
    throw new Error("Invalid privacy setting");
  }

  // Create post with tags
  const post = await prisma.post.create({
    data: {
      authorId,
      content,
      mediaUrl,
      postType,
      categoryId,
      privacy,
      tags: {
        create: tags?.map((tag) => ({ tag })) || [],
      },
    },
    include: {
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true,
        },
      },
      category: true,
      tags: true,
      comments: {
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
            },
          },
        },
      },
    },
  });

  return post;
};

exports.getPost = async (postId, currentUserId = null) => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true,
        },
      },
      category: true,
      tags: true,
      comments: {
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
            },
          },
        },
      },
      _count: {
        select: {
          comments: true,
          likes: true,
        },
      },
    },
  });

  if (!post) {
    throw new Error("Post not found");
  }

  // Check if current user liked this post
  let userLiked = false;
  if (currentUserId) {
    const userLike = await prisma.postLike.findFirst({
      where: {
        postId,
        userId: currentUserId,
      },
    });
    userLiked = !!userLike;
  }

  return {
    ...post,
    userLiked,
  };
};

exports.updatePost = async (postId, authorId, updateData) => {
  // Check if post exists and belongs to user
  const existingPost = await prisma.post.findFirst({
    where: {
      id: postId,
      authorId,
    },
  });

  if (!existingPost) {
    throw new Error("Post not found or unauthorized");
  }

  // Update post
  const post = await prisma.post.update({
    where: { id: postId },
    data: {
      content: updateData.content,
      mediaUrl: updateData.mediaUrl,
      categoryId: updateData.categoryId,
      privacy: updateData.privacy,
      tags: {
        deleteMany: {},
        create: updateData.tags?.map((tag) => ({ tag })) || [],
      },
    },
    include: {
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true,
        },
      },
      category: true,
      tags: true,
      comments: {
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
            },
          },
        },
      },
    },
  });

  return post;
};

exports.deletePost = async (postId, authorId) => {
  // Check if post exists and belongs to user
  const existingPost = await prisma.post.findFirst({
    where: {
      id: postId,
      authorId,
    },
  });

  if (!existingPost) {
    throw new Error("Post not found or unauthorized");
  }

  // Delete related records first
  await prisma.$transaction([
    // Delete comments
    prisma.comment.deleteMany({
      where: { postId },
    }),
    // Delete likes
    prisma.postLike.deleteMany({
      where: { postId },
    }),
    // Delete tags
    prisma.postTag.deleteMany({
      where: { postId },
    }),
    // Finally delete the post
    prisma.post.delete({
      where: { id: postId },
    }),
  ]);

  return { message: "Post deleted successfully" };
};

exports.getUserPosts = async (
  userId,
  page = 1,
  limit = 10,
  currentUserId = null
) => {
  const skip = (page - 1) * limit;

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where: { authorId: userId },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
          },
        },
        category: true,
        tags: true,
        comments: {
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                username: true,
              },
            },
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.post.count({
      where: { authorId: userId },
    }),
  ]);

  // Check if current user liked each post
  const postsWithUserLikes = await Promise.all(
    posts.map(async (post) => {
      let userLiked = false;
      if (currentUserId) {
        const userLike = await prisma.postLike.findFirst({
          where: {
            postId: post.id,
            userId: currentUserId,
          },
        });
        userLiked = !!userLike;
      }
      return {
        ...post,
        userLiked,
      };
    })
  );

  return {
    posts: postsWithUserLikes,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

exports.getAllPosts = async (page = 1, limit = 10, currentUserId = null) => {
  const skip = (page - 1) * limit;

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
          },
        },
        category: true,
        tags: true,
        comments: {
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                username: true,
              },
            },
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.post.count(),
  ]);

  // Check if current user liked each post
  const postsWithUserLikes = await Promise.all(
    posts.map(async (post) => {
      let userLiked = false;
      if (currentUserId) {
        const userLike = await prisma.postLike.findFirst({
          where: {
            postId: post.id,
            userId: currentUserId,
          },
        });
        userLiked = !!userLike;
      }
      return {
        ...post,
        userLiked,
      };
    })
  );

  return {
    posts: postsWithUserLikes,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

exports.adminDeletePost = async (postId) => {
  // Check if post exists
  const existingPost = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!existingPost) {
    throw new Error("Post not found");
  }

  // Delete post
  await prisma.post.delete({
    where: { id: postId },
  });

  return { message: "Post deleted successfully" };
};
