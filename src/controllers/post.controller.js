const postService = require("../services/post.service");

exports.createPost = async (req, res) => {
  try {
    const post = await postService.createPost({
      ...req.body,
      authorId: req.user.id, // From auth middleware
    });

    res.status(201).json({
      success: true,
      data: post,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
};

exports.getPost = async (req, res) => {
  try {
    const post = await postService.getPost(req.params.id, req.user?.id);

    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (err) {
    res.status(404).json({
      success: false,
      error: err.message,
    });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const post = await postService.updatePost(
      req.params.id,
      req.user.id,
      req.body
    );

    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const result = await postService.deletePost(req.params.id, req.user.id);

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

exports.getUserPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await postService.getUserPosts(
      req.params.userId,
      parseInt(page),
      parseInt(limit),
      req.user?.id
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

// Admin controller functions
exports.getAllPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await postService.getAllPosts(
      parseInt(page),
      parseInt(limit),
      req.user?.id
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

exports.adminDeletePost = async (req, res) => {
  try {
    const result = await postService.adminDeletePost(req.params.id);

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
