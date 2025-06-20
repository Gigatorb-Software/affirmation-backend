const notificationService = require("../services/notification.service");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Helper: check if user is admin
const isAdmin = (user) => user && user.isAdmin;

module.exports = {
  // Set affirmation notification schedule (store in DB for now)
  async setAffirmationSchedule(req, res) {
    if (!isAdmin(req.user)) return res.status(403).json({ error: "Forbidden" });
    const { times, count } = req.body;
    // Save to a simple config table or in-memory (for demo, just respond OK)
    // TODO: Implement persistent storage and scheduler update
    res.json({ message: "Affirmation schedule set", times, count });
  },

  // Schedule a community update
  async scheduleCommunityUpdate(req, res) {
    if (!isAdmin(req.user)) return res.status(403).json({ error: "Forbidden" });
    const { title, body, time, target } = req.body;
    // TODO: Save to DB and set up a scheduler
    res.json({
      message: "Community update scheduled",
      title,
      body,
      time,
      target,
    });
  },

  // Schedule a system announcement
  async scheduleAnnouncement(req, res) {
    if (!isAdmin(req.user)) return res.status(403).json({ error: "Forbidden" });
    const { title, body, time } = req.body;
    // TODO: Save to DB and set up a scheduler
    res.json({ message: "System announcement scheduled", title, body, time });
  },

  // Manual broadcast (immediate)
  async manualBroadcast(req, res) {
    if (!isAdmin(req.user)) return res.status(403).json({ error: "Forbidden" });
    const { title, body, target } = req.body;
    // Fetch users based on target
    const where = target === "premium" ? { isPremium: true } : {};
    const users = await prisma.user.findMany({ where });
    let sent = 0;
    for (const user of users) {
      if (!user.fcmToken) continue;
      await notificationService.createNotification(
        user.id,
        "ANNOUNCEMENT",
        body
      );
      sent++;
    }
    res.json({ message: `Broadcast sent to ${sent} users.` });
  },
};
