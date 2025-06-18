const affirmationService = require("../services/affirmation.service");

class AffirmationController {
  // Create a new affirmation
  async createAffirmation(req, res) {
    try {
      const affirmation = await affirmationService.createAffirmation({
        ...req.body,
        userId: req.user.id,
      });
      res.status(201).json(affirmation);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Get all affirmations
  async getAllAffirmations(req, res) {
    try {
      const affirmations = await affirmationService.getAllAffirmations(
        req.user.id,
        req.query.isPremium === "true"
      );
      res.json(affirmations);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get affirmation by ID
  async getAffirmationById(req, res) {
    try {
      const affirmation = await affirmationService.getAffirmationById(
        req.params.id,
        req.user.id
      );
      res.json(affirmation);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  // Update affirmation
  async updateAffirmation(req, res) {
    try {
      const affirmation = await affirmationService.updateAffirmation(
        req.params.id,
        req.body,
        req.user.id
      );
      res.json(affirmation);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Delete affirmation
  async deleteAffirmation(req, res) {
    try {
      await affirmationService.deleteAffirmation(req.params.id, req.user.id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Record affirmation history
  async recordAffirmationHistory(req, res) {
    try {
      const history = await affirmationService.recordAffirmationHistory(
        req.user.id,
        req.params.affirmationId
      );
      res.status(201).json(history);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Get user's affirmation history
  async getUserAffirmationHistory(req, res) {
    try {
      const history = await affirmationService.getUserAffirmationHistory(
        req.user.id
      );
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Mark affirmation as completed
  async markAffirmationCompleted(req, res) {
    try {
      const history = await affirmationService.markAffirmationCompleted(
        req.params.historyId,
        req.user.id
      );
      res.json(history);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Get affirmations by category
  async getAffirmationsByCategory(req, res) {
    try {
      const affirmations = await affirmationService.getAffirmationsByCategory(
        req.params.categoryId,
        req.user.id
      );
      res.json(affirmations);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Test endpoint to trigger affirmation notifications manually
  async testSendAffirmationNotification(req, res) {
    try {
      const {
        sendAffirmationNotifications,
      } = require("../scheduler/affirmationScheduler");
      await sendAffirmationNotifications();
      res.status(200).json({ message: "Affirmation notifications sent." });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new AffirmationController();
