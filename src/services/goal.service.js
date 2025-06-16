const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class GoalService {
  // Create a new goal
  async createGoal(data) {
    return prisma.goal.create({
      data: {
        userId: data.userId,
        title: data.title,
        description: data.description,
        targetDate: data.targetDate,
        status: data.status || 'ACTIVE',
        progress: data.progress || 0,
        tasksDone: data.tasksDone || 0,
      },
      include: {
        user: true,
        milestones: true,
      },
    });
  }

  // Get all goals for a user
  async getUserGoals(userId) {
    return prisma.goal.findMany({
      where: { userId },
      include: {
        milestones: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Get goal by ID
  async getGoalById(id) {
    return prisma.goal.findUnique({
      where: { id },
      include: {
        user: true,
        milestones: true,
      },
    });
  }

  // Update goal
  async updateGoal(id, data, userId) {
    const goal = await prisma.goal.findUnique({
      where: { id },
    });

    if (!goal) {
      throw new Error('Goal not found');
    }

    if (goal.userId !== userId) {
      throw new Error('Not authorized to update this goal');
    }

    return prisma.goal.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        targetDate: data.targetDate,
        status: data.status,
        progress: data.progress,
        tasksDone: data.tasksDone,
      },
      include: {
        milestones: true,
      },
    });
  }

  // Delete goal
  async deleteGoal(id, userId) {
    const goal = await prisma.goal.findUnique({
      where: { id },
    });

    if (!goal) {
      throw new Error('Goal not found');
    }

    if (goal.userId !== userId) {
      throw new Error('Not authorized to delete this goal');
    }

    return prisma.goal.delete({
      where: { id },
    });
  }

  // Add milestone to goal
  async addMilestone(goalId, description, userId) {
    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
    });

    if (!goal) {
      throw new Error('Goal not found');
    }

    if (goal.userId !== userId) {
      throw new Error('Not authorized to add milestone to this goal');
    }

    return prisma.goalMilestone.create({
      data: {
        goalId,
        description,
      },
    });
  }

  // Update milestone
  async updateMilestone(id, description, userId) {
    const milestone = await prisma.goalMilestone.findUnique({
      where: { id },
      include: {
        goal: true,
      },
    });

    if (!milestone) {
      throw new Error('Milestone not found');
    }

    if (milestone.goal.userId !== userId) {
      throw new Error('Not authorized to update this milestone');
    }

    return prisma.goalMilestone.update({
      where: { id },
      data: {
        description,
      },
    });
  }

  // Delete milestone
  async deleteMilestone(id, userId) {
    const milestone = await prisma.goalMilestone.findUnique({
      where: { id },
      include: {
        goal: true,
      },
    });

    if (!milestone) {
      throw new Error('Milestone not found');
    }

    if (milestone.goal.userId !== userId) {
      throw new Error('Not authorized to delete this milestone');
    }

    return prisma.goalMilestone.delete({
      where: { id },
    });
  }

  // Get goal milestones
  async getGoalMilestones(goalId, userId) {
    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
    });

    if (!goal) {
      throw new Error('Goal not found');
    }

    if (goal.userId !== userId) {
      throw new Error('Not authorized to view these milestones');
    }

    return prisma.goalMilestone.findMany({
      where: { goalId },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}

module.exports = new GoalService(); 