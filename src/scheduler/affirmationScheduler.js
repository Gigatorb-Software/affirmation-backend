const cron = require("node-cron");
const { PrismaClient } = require("@prisma/client");
const notificationService = require("../services/notification.service");

const prisma = new PrismaClient();

// Function to send affirmation notifications
async function sendAffirmationNotifications() {
  try {
    // Fetch all users
    const users = await prisma.user.findMany();

    // Fetch all affirmations
    const affirmations = await prisma.affirmation.findMany();
    if (affirmations.length === 0) {
      console.log("No affirmations found");
      return;
    }

    // Send a random affirmation to each user
    for (const user of users) {
      if (!user.fcmToken) {
        console.log(`Skipping user ${user.id} - no FCM token`);
        continue;
      }
      const randomAffirmation =
        affirmations[Math.floor(Math.random() * affirmations.length)];
      await notificationService.createNotification(
        user.id,
        "AFFIRMATION",
        randomAffirmation.content
      );
      await notificationService.sendPushNotification(
        user.id,
        "New Affirmation",
        randomAffirmation.content
      );
    }
  } catch (error) {
    console.error("Error sending affirmation notifications:", error);
  }
}

// Schedule the job to run at 12:31pm every day
cron.schedule(
  "* * * * *",
  () => {
    console.log("Scheduler triggered at:", new Date().toISOString());
    sendAffirmationNotifications();
  },
  {
    timezone: "Asia/Kolkata",
  }
);

console.log("Affirmation notification scheduler started");

module.exports = { sendAffirmationNotifications };
