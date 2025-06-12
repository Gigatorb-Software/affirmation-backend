const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.createComment = async ({ postId, authorId, content }) => {
  // Check if post exists
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) {
    throw new Error("Post not found");
  }

  if (!content || content.trim().length === 0) {
    throw new Error("Comment content cannot be empty");
  }

  const comment = await prisma.comment.create({
    data: {
      postId,
      authorId,
      content: content.trim(),
    },
    select: {
      id: true,
      content: true,
      createdAt: true,
      author: {
        select: {
          id: true,
          username: true,
        },
      },
    },
  });

  return comment;
};

exports.getPostComments = async (postId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const [comments, total] = await Promise.all([
    prisma.comment.findMany({
      where: { postId },
      select: {
        id: true,
        content: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.comment.count({
      where: { postId },
    }),
  ]);

  return {
    comments,
    total,
  };
};

exports.updateComment = async (commentId, authorId, content) => {
  if (!content || content.trim().length === 0) {
    throw new Error("Comment content cannot be empty");
  }

  // Check if comment exists and belongs to user
  const existingComment = await prisma.comment.findFirst({
    where: {
      id: commentId,
      authorId,
    },
  });

  if (!existingComment) {
    throw new Error("Comment not found or unauthorized");
  }

  const comment = await prisma.comment.update({
    where: { id: commentId },
    data: { content: content.trim() },
    select: {
      id: true,
      content: true,
      updatedAt: true,
      author: {
        select: {
          id: true,
          username: true,
        },
      },
    },
  });

  return comment;
};

exports.deleteComment = async (commentId, authorId) => {
  // Check if comment exists and belongs to user
  const existingComment = await prisma.comment.findFirst({
    where: {
      id: commentId,
      authorId,
    },
  });

  if (!existingComment) {
    throw new Error("Comment not found or unauthorized");
  }

  await prisma.comment.delete({
    where: { id: commentId },
  });

  return { success: true };
};
