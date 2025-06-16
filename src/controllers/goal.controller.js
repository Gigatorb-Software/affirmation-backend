const goalService = require("../services/goal.service");

class GoalController {
  // Create a new goal
  async createGoal(req, res) {
    try {
      const goal = await goalService.createGoal({
        ...req.body,
        userId: req.user.id,
      });
      res.status(201).json(goal);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Get all goals for the authenticated user
  async getUserGoals(req, res) {
    try {
      const goals = await goalService.getUserGoals(req.user.id);
      res.json(goals);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get goal by ID
  async getGoalById(req, res) {
    try {
      const goal = await goalService.getGoalById(req.params.id);
      if (!goal) {
        return res.status(404).json({ error: "Goal not found" });
      }
      res.json(goal);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Update goal
  async updateGoal(req, res) {
    try {
      const goal = await goalService.updateGoal(
        req.params.id,
        req.body,
        req.user.id
      );
      res.json(goal);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Delete goal
  async deleteGoal(req, res) {
    try {
      await goalService.deleteGoal(req.params.id, req.user.id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Add milestone to goal
  async addMilestone(req, res) {
    try {
      const milestone = await goalService.addMilestone(
        req.params.goalId,
        req.body.description,
        req.user.id
      );
      res.status(201).json(milestone);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Update milestone
  async updateMilestone(req, res) {
    try {
      const milestone = await goalService.updateMilestone(
        req.params.id,
        req.body.description,
        req.user.id
      );
      res.json(milestone);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Delete milestone
  async deleteMilestone(req, res) {
    try {
      await goalService.deleteMilestone(req.params.id, req.user.id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Get goal milestones
  async getGoalMilestones(req, res) {
    try {
      const milestones = await goalService.getGoalMilestones(
        req.params.goalId,
        req.user.id
      );
      res.json(milestones);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new GoalController();
