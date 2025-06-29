const analyticsService = require("../services/analytics.service");

class AnalyticsController {
  // Get comprehensive dashboard analytics
  async getDashboardAnalytics(req, res) {
    try {
      const analytics = await analyticsService.getDashboardAnalytics();

      res.status(200).json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      console.error("Error getting dashboard analytics:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Get affirmation analytics
  async getAffirmationAnalytics(req, res) {
    try {
      const analytics = await analyticsService.getAffirmationAnalytics();

      res.status(200).json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      console.error("Error getting affirmation analytics:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Get post analytics
  async getPostAnalytics(req, res) {
    try {
      const analytics = await analyticsService.getPostAnalytics();

      res.status(200).json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      console.error("Error getting post analytics:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Get user growth analytics
  async getUserGrowthAnalytics(req, res) {
    try {
      const analytics = await analyticsService.getUserGrowthAnalytics();

      res.status(200).json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      console.error("Error getting user growth analytics:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Get popular affirmations
  async getPopularAffirmations(req, res) {
    try {
      const analytics = await analyticsService.getAffirmationAnalytics();
      const popularAffirmations = analytics.popularAffirmations.slice(0, 5);

      res.status(200).json({
        success: true,
        data: popularAffirmations,
      });
    } catch (error) {
      console.error("Error getting popular affirmations:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Get affirmation completion rate
  async getAffirmationCompletionRate(req, res) {
    try {
      const completionRate =
        await analyticsService.getAffirmationCompletionRate();

      res.status(200).json({
        success: true,
        data: completionRate,
      });
    } catch (error) {
      console.error("Error getting affirmation completion rate:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}

module.exports = new AnalyticsController();
