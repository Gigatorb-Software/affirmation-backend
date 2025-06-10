const categoryService = require("../services/category.service");

exports.createCategory = async (req, res) => {
  try {
    const category = await categoryService.createCategory(req.body);

    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
};

exports.getCategory = async (req, res) => {
  try {
    const category = await categoryService.getCategory(req.params.id);

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (err) {
    res.status(404).json({
      success: false,
      error: err.message,
    });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await categoryService.getAllCategories(
      parseInt(page),
      parseInt(limit)
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const category = await categoryService.updateCategory(
      req.params.id,
      req.body
    );

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const result = await categoryService.deleteCategory(req.params.id);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
};
