const likeService = require("../services/like.service");
const commentService = require("../services/comment.service");

// Like controllers
exports.toggleLike = async (req, res) => {
  try {
    const result = await likeService.toggleLike(req.params.postId, req.user.id);

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

exports.getPostLikes = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await likeService.getPostLikes(
      req.params.postId,
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

// Comment controllers
exports.createComment = async (req, res) => {
  try {
    const comment = await commentService.createComment({
      postId: req.params.postId,
      authorId: req.user.id,
      content: req.body.content,
    });

    res.status(201).json({
      success: true,
      data: comment,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
};

exports.getPostComments = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await commentService.getPostComments(
      req.params.postId,
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

exports.updateComment = async (req, res) => {
  try {
    const comment = await commentService.updateComment(
      req.params.commentId,
      req.user.id,
      req.body.content
    );

    res.status(200).json({
      success: true,
      data: comment,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const result = await commentService.deleteComment(
      req.params.commentId,
      req.user.id
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
