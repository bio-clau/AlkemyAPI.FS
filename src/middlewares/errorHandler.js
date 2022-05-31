const ErrorResponse = require("../utils/errorConstructor");

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  if (err.code === 11000) {
    const message = "Duplicate Field Value Enter";
    error = new ErrorResponse(message, 400);
  }
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((val) => val.message);
    error = new ErrorResponse(message, 400);
  }
  console.log("error:", error);
  res.status(error.statusCode || 500).json({
    success: false,
    msg: error.message || "Server Error",
  });
};

module.exports = errorHandler;
