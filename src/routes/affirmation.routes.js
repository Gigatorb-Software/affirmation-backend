const express = require("express");
const router = express.Router();
const affirmationController = require("../controllers/affirmation.controller");
const { authenticate } = require("../middleware/auth");

// Apply authentication middleware to all routes
router.use(authenticate);

// Affirmation routes
router.post("/", affirmationController.createAffirmation);
router.get("/", affirmationController.getAllAffirmations);
router.get("/:id", affirmationController.getAffirmationById);
router.put("/:id", affirmationController.updateAffirmation);
router.delete("/:id", affirmationController.deleteAffirmation);

// Category-based routes
router.get(
  "/category/:categoryId",
  affirmationController.getAffirmationsByCategory
);

// History routes
router.post(
  "/:affirmationId/history",
  affirmationController.recordAffirmationHistory
);
router.get("/history", affirmationController.getUserAffirmationHistory);
router.put(
  "/history/:historyId/complete",
  affirmationController.markAffirmationCompleted
);

module.exports = router;
