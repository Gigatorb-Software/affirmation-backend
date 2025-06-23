const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth.routes");
const postRoutes = require("./routes/post.routes");
const categoryRoutes = require("./routes/category.routes");
const interactionRoutes = require("./routes/interaction.routes");
const communityRoutes = require("./routes/community.routes");
const goalRoutes = require("./routes/goal.routes");
const affirmationRoutes = require("./routes/affirmation.routes");
const notificationRoutes = require("./routes/notification.routes");
const adminNotificationRoutes = require("./routes/adminNotification.routes");
const userManagementRoutes = require("./routes/userManagement.routes");
const setupSwagger = require("./config/swagger");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Setup Swagger
setupSwagger(app);

// CORS configuration
const allowedOrigins = [
  "http://localhost:3000", // your frontend in dev
  "http://localhost:5173", // your deployed frontend
  `http://localhost:${PORT}`, // allow swagger UI origin
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps or curl)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/post", postRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/interaction", interactionRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/affirmations", affirmationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin/notifications", adminNotificationRoutes);
app.use("/api/admin/users", userManagementRoutes);

app.listen(PORT, () => {
  console.log(`App listening to Port ${PORT}`);
});
