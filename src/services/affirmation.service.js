const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class AffirmationService {
  // Create a new affirmation
  async createAffirmation(data) {
    return prisma.affirmation.create({
      data: {
        content: data.content,
        audioUrl: data.audioUrl,
        categoryId: data.categoryId,
        userId: data.userId,
        isPremium: data.isPremium || false,
      },
      include: {
        category: true,
        createdBy: true,
      },
    });
  }

  // Get all affirmations
  async getAllAffirmations(userId, isPremium = false) {
    return prisma.affirmation.findMany({
      where: {
        OR: [{ isPremium: false }, { isPremium: true, userId: userId }],
      },
      include: {
        category: true,
        createdBy: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  // Get affirmation by ID
  async getAffirmationById(id, userId) {
    const affirmation = await prisma.affirmation.findUnique({
      where: { id },
      include: {
        category: true,
        createdBy: true,
      },
    });

    if (!affirmation) {
      throw new Error("Affirmation not found");
    }

    if (affirmation.isPremium && affirmation.userId !== userId) {
      throw new Error("Not authorized to access this affirmation");
    }

    return affirmation;
  }

  // Update affirmation
  async updateAffirmation(id, data, userId) {
    const affirmation = await prisma.affirmation.findUnique({
      where: { id },
    });

    if (!affirmation) {
      throw new Error("Affirmation not found");
    }

    if (affirmation.userId !== userId) {
      throw new Error("Not authorized to update this affirmation");
    }

    return prisma.affirmation.update({
      where: { id },
      data: {
        content: data.content,
        audioUrl: data.audioUrl,
        categoryId: data.categoryId,
        isPremium: data.isPremium,
      },
      include: {
        category: true,
        createdBy: true,
      },
    });
  }

  // Delete affirmation
  async deleteAffirmation(id, userId) {
    const affirmation = await prisma.affirmation.findUnique({
      where: { id },
    });

    if (!affirmation) {
      throw new Error("Affirmation not found");
    }

    if (affirmation.userId !== userId) {
      throw new Error("Not authorized to delete this affirmation");
    }

    return prisma.affirmation.delete({
      where: { id },
    });
  }

  // Record affirmation history
  async recordAffirmationHistory(userId, affirmationId) {
    return prisma.affirmationHistory.create({
      data: {
        userId,
        affirmationId,
      },
      include: {
        affirmation: true,
        user: true,
      },
    });
  }

  // Get user's affirmation history
  async getUserAffirmationHistory(userId) {
    return prisma.affirmationHistory.findMany({
      where: { userId },
      include: {
        affirmation: {
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        seenAt: "desc",
      },
    });
  }

  // Mark affirmation as completed
  async markAffirmationCompleted(historyId, userId) {
    const history = await prisma.affirmationHistory.findUnique({
      where: { id: historyId },
    });

    if (!history) {
      throw new Error("Affirmation history not found");
    }

    if (history.userId !== userId) {
      throw new Error("Not authorized to update this affirmation history");
    }

    return prisma.affirmationHistory.update({
      where: { id: historyId },
      data: {
        isCompleted: true,
      },
      include: {
        affirmation: true,
      },
    });
  }

  // Get affirmations by category
  async getAffirmationsByCategory(categoryId, userId) {
    return prisma.affirmation.findMany({
      where: {
        categoryId,
        OR: [{ isPremium: false }, { isPremium: true, userId: userId }],
      },
      include: {
        category: true,
        createdBy: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}

module.exports = new AffirmationService();
