const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.createCategory = async ({ name, description, isPremium }) => {
  // Check if category already exists
  const existingCategory = await prisma.category.findUnique({
    where: { name },
  });

  if (existingCategory) {
    throw new Error("Category with this name already exists");
  }

  const category = await prisma.category.create({
    data: {
      name,
      description,
      isPremium,
    },
  });

  return category;
};

exports.getCategory = async (categoryId) => {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: {
      posts: {
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
      affirmations: true,
      communityPosts: {
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

  if (!category) {
    throw new Error("Category not found");
  }

  return category;
};

exports.getAllCategories = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const [categories, total] = await Promise.all([
    prisma.category.findMany({
      include: {
        _count: {
          select: {
            posts: true,
            affirmations: true,
            communityPosts: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { name: "asc" },
    }),
    prisma.category.count(),
  ]);

  return {
    categories,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

exports.updateCategory = async (
  categoryId,
  { name, description, isPremium }
) => {
  // Check if category exists
  const existingCategory = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!existingCategory) {
    throw new Error("Category not found");
  }

  // Check if new name is already taken by another category
  if (name && name !== existingCategory.name) {
    const nameExists = await prisma.category.findUnique({
      where: { name },
    });

    if (nameExists) {
      throw new Error("Category with this name already exists");
    }
  }

  const category = await prisma.category.update({
    where: { id: categoryId },
    data: {
      name,
      description,
      isPremium,
    },
  });

  return category;
};

exports.deleteCategory = async (categoryId) => {
  // Check if category exists
  const existingCategory = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!existingCategory) {
    throw new Error("Category not found");
  }

  // Check if category has any associated content
  const categoryWithContent = await prisma.category.findUnique({
    where: { id: categoryId },
    include: {
      _count: {
        select: {
          posts: true,
          affirmations: true,
          communityPosts: true,
        },
      },
    },
  });

  if (
    categoryWithContent._count.posts > 0 ||
    categoryWithContent._count.affirmations > 0 ||
    categoryWithContent._count.communityPosts > 0
  ) {
    throw new Error("Cannot delete category with associated content");
  }

  await prisma.category.delete({
    where: { id: categoryId },
  });

  return { message: "Category deleted successfully" };
};
