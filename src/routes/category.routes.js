const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/category.controller");
const { authenticate, authorizeRoles } = require("../middleware/auth");

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: API for managing categories
 */

/**
 * @swagger
 * /category:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: A list of categories
 */
router.get("/", categoryController.getAllCategories);

/**
 * @swagger
 * /category:
 *   post:
 *     summary: Create a new category (Admin only)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               isPremium:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Category created successfully
 */
router.post(
  "/",
  authenticate,
  authorizeRoles("ADMIN"),
  categoryController.createCategory
);

/**
 * @swagger
 * /category/{id}:
 *   put:
 *     summary: Update a category (Admin only)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               isPremium:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Category updated successfully
 */
router.put(
  "/:id",
  authenticate,
  authorizeRoles("ADMIN"),
  categoryController.updateCategory
);

/**
 * @swagger
 * /category/{id}:
 *   delete:
 *     summary: Delete a category (Admin only)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Category deleted successfully
 */
router.delete(
  "/:id",
  authenticate,
  authorizeRoles("ADMIN"),
  categoryController.deleteCategory
);

module.exports = router;
