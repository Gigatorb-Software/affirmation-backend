const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.toggleLike = async (postId, userId) => {
  // Check if post exists
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) {
    throw new Error("Post not found");
  }

  // Check if user already liked the post
  const existingLike = await prisma.postLike.findFirst({
    where: {
      postId,
      userId,
    },
  });

  if (existingLike) {
    // Unlike the post
    await prisma.postLike.delete({
      where: { id: existingLike.id },
    });

    return { liked: false };
  } else {
    // Like the post
    await prisma.postLike.create({
      data: {
        postId,
        userId,
      },
    });

    return { liked: true };
  }
};

exports.getPostLikes = async (postId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const [likes, total] = await Promise.all([
    prisma.postLike.findMany({
      where: { postId },
      select: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        createdAt: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.postLike.count({
      where: { postId },
    }),
  ]);

  return {
    likes,
    total,
  };
};
