const { cloudinary } = require("../config/cloudinary");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const ErrorResponse = require("../utils/errorConstructor");

exports.updateUser = async (req, res, next) => {
  const { email, firstName, lastName, uploadImg, image } = req.body;
  const { id } = req.params;
  try {
    if (!email || !firstName || !lastName) {
      return next(new ErrorResponse("Missing Fields", 400));
    }
    if (uploadImg) {
      result = await cloudinary.uploader.upload(image);
      if (!result) return next(new ErrorResponse("Image Upload Failed", 503));
    }
    const user = await User.findByPk(id);
    if (!user) return next(new ErrorResponse("User Not Found", 404));
    user.email = email;
    user.firstName = firstName;
    user.lastName = lastName;
    user.image = uploadImg ? result.url : image;
    await user.save();
    res.status(201).json({
      success: true,
      msg: "User updated",
      data: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        image: user.image,
        total: user.total,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.updatePass = async (req, res, next) => {
  const { id } = req.params;
  const { newPass } = req.body;
  try {
    if (!newPass) {
      return next(new ErrorResponse("Missing Fields", 400));
    }
    const user = await User.findByPk(id);
    if (!user) return next(new ErrorResponse("User Not Found", 404));
    user.password = newPass;
    await user.save();
    res.status(201).json({
      success: true,
      msg: "Password updated",
      data: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        image: user.image,
        total: user.total,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.jwt) return next(new ErrorResponse("Not Authorized", 401));
    const refreshToken = cookies.jwt;
    const foundUser = await User.findOne({
      where: {
        refreshToken,
      },
    });
    if (!foundUser) return next(new ErrorResponse("Forbidden", 403));
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    if (foundUser.id !== decoded.id)
      return next(new ErrorResponse("Forbidden", 403));
    const accessToken = await foundUser.getSignedToken();
    res.status(200).json({
      success: true,
      acccessToken: accessToken,
    });
  } catch (err) {
    next(err);
  }
};
