const notificationService = require("../services/notification.service");

class NotificationController {
  async getUserNotifications(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const notifications = await notificationService.getUserNotifications(
        req.user.id,
        page,
        limit
      );
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async markAsRead(req, res) {
    try {
      await notificationService.markNotificationAsRead(req.params.id, req.user.id);
      res.json({ success: true, message: "Notification marked as read" });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async markAllAsRead(req, res) {
    try {
      await notificationService.markAllNotificationsAsRead(req.user.id);
      res.json({ success: true, message: "All notifications marked as read" });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async deleteNotification(req, res) {
    try {
      await notificationService.deleteNotification(req.params.id, req.user.id);
      res.status(204).send();
    } catch (error)      {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = new NotificationController(); 