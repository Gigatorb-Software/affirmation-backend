const authService = require("../services/auth.service");

exports.register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message || "Registration failed",
    });
  }
};

exports.login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    // Handle specific error cases
    if (err.message === "User not found") {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    if (err.message === "Invalid credentials") {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    // Handle other errors
    res.status(400).json({
      success: false,
      error: err.message || "Login failed",
    });
  }
};
