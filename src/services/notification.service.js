const { PrismaClient } = require("@prisma/client");
const admin = require("../utils/firebase");

const prisma = new PrismaClient();

const sendNotification = async (userId, notification) => {
  try {
    console.log("Fetching user FCM token for userId:", userId);
    // Get user's FCM token from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { fcmToken: true },
    });

    console.log("User FCM token status:", {
      userId,
      hasToken: !!user?.fcmToken,
    });

    if (!user?.fcmToken) {
      throw new Error("User has no FCM token registered");
    }

    // Prepare notification message
    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: notification.data || {},
      token: user.fcmToken,
    };

    try {
      // Send message
      const response = await admin.messaging().send(message);

      // Save notification to database
      const notificationData = {
        userId,
        title: notification.title,
        body: notification.body,
        message: notification.message || notification.body, // Use body as message if not provided
        type: notification.type || "GENERAL",
        data: notification.data || {},
        isRead: false,
      };

      console.log("Creating notification record:", notificationData);

      const savedNotification = await prisma.notification.create({
        data: notificationData,
      });

      console.log("Notification saved to database:", savedNotification);

      return response;
    } catch (error) {
      // Handle invalid token
      if (error.code === "messaging/registration-token-not-registered") {
        console.log("Removing invalid FCM token for user:", userId);
        await removeUserFCMToken(userId);
        throw new Error(
          "Notification token expired. Please refresh the page to get new notifications."
        );
      }
      throw error;
    }
  } catch (error) {
    console.error("Error sending notification:", error);
    throw error;
  }
};

// Function used by the scheduler
const createNotification = async (userId, type, message) => {
  try {
    const notification = {
      title: type === "AFFIRMATION" ? "Daily Affirmation" : "Notification",
      body: message,
      message: message,
      type: type,
      data: {},
    };

    return await sendNotification(userId, notification);
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

// Function used by the scheduler
const sendPushNotification = async (userId, title, body) => {
  try {
    const notification = {
      title,
      body,
      message: body,
      type: "GENERAL",
      data: {},
    };

    return await sendNotification(userId, notification);
  } catch (error) {
    console.error("Error sending push notification:", error);
    throw error;
  }
};

const saveUserFCMToken = async (userId, token) => {
  try {
    console.log("Attempting to save FCM token for user:", userId);
    console.log("Token to save:", token);

    // Validate the token with Firebase first
    try {
      console.log("Validating FCM token with Firebase...");
      await admin.messaging().send({
        token: token,
        data: { test: "true" },
        android: { priority: "normal" },
        apns: { headers: { "apns-priority": "5" } },
      });
      console.log("FCM token validation successful");
    } catch (error) {
      console.error("FCM token validation failed:", error);
      if (error.code === "messaging/registration-token-not-registered") {
        throw new Error("Invalid FCM token provided");
      }
      // If it's not a token validation error, we can proceed with saving
      console.log("Proceeding with token save despite validation error");
    }

    console.log("Updating user record with FCM token...");
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { fcmToken: token },
      select: { id: true, fcmToken: true },
    });
    console.log("User record updated successfully:", updatedUser);

    return true;
  } catch (error) {
    console.error("Error saving FCM token:", error);
    throw error;
  }
};

const removeUserFCMToken = async (userId) => {
  try {
    console.log("Removing FCM token for user:", userId);
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { fcmToken: null },
      select: { id: true, fcmToken: true },
    });
    console.log("FCM token removed successfully:", updatedUser);
    return true;
  } catch (error) {
    console.error("Error removing FCM token:", error);
    throw error;
  }
};

const getUserNotifications = async (userId, page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.notification.count({
        where: { userId },
      }),
    ]);

    return {
      notifications,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

const markNotificationAsRead = async (notificationId, userId) => {
  try {
    await prisma.notification.update({
      where: {
        id: notificationId,
        userId,
      },
      data: {
        isRead: true,
      },
    });
    return true;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

module.exports = {
  sendNotification,
  createNotification,
  sendPushNotification,
  saveUserFCMToken,
  removeUserFCMToken,
  getUserNotifications,
  markNotificationAsRead,
};
