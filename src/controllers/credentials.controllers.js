const ErrorResponse = require("../utils/errorConstructor");
const { Op } = require("sequelize");
const { v4: uuidv4 } = require("uuid");
const { cloudinary } = require("../config/cloudinary");
const crypto = require("crypto");
const User = require("../models/User");

exports.register = async (req, res, next) => {
  const { email, firstName, lastName, password, image } = req.body;
  try {
    if (!email || !firstName || !lastName || !password) {
      return next(new ErrorResponse("Missing Fields", 400));
    }
    const duplicate = await User.findAll({
      where: {
        email: email,
      },
    });
    if (duplicate.length > 0)
      return next(new ErrorResponse("email already in use"), 400);
    let result = {};
    if (!image) {
      result = {
        url: "https://res.cloudinary.com/tropura/image/upload/v1653866106/guest-user_je8e9t.jpg",
      };
    } else {
      result = await cloudinary.uploader.upload(image);
      if (!result) return next(new ErrorResponse("Image Upload Failed", 503));
    }
    let user = await User.create({
      id: uuidv4(),
      image: result.url,
      email,
      firstName,
      lastName,
      password,
    });
    const accessToken = await user.getSignedToken();
    const refreshToken = await user.getRefreshToken();
    user.refreshToken = refreshToken;
    const aux = await user.save();
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "None",
      secure: true,
    });
    //Agregar cuando pruebe con front: sameSite:'None', secure:true
    res.status(201).json({
      success: true,
      accessToken: accessToken,
      msg: "User created",
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

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({
      where: {
        email: email,
      },
    });
    let match;
    if (user) {
      match = await user.matchPassword(password);
    } else {
      return next(new ErrorResponse("Invalid Credentials", 401));
    }
    if (!match) {
      return next(new ErrorResponse("Invalid Credentials", 401));
    }
    const accessToken = await user.getSignedToken();
    const refreshToken = await user.getRefreshToken();
    user.refreshToken = refreshToken;
    await user.save();
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "None",
      secure: true,
    });
    //Agregar cuando pruebe con front: sameSite:'None', secure:true

    res.status(200).json({
      success: true,
      accessToken: accessToken,
      msg: "Login successfull",
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

exports.forgotPass = async (req, res, next) => {
  const { email } = req.body;
  try {
    if (!email) {
      return next(new ErrorResponse("Invalid Credential", 401));
    }
    const user = await User.findOne({
      where: {
        email: email,
      },
    });
    if (!user) {
      return next(new ErrorResponse("Email not found", 404));
    }
    const resetToken = await user.getResetPasswordToken();
    await user.save();
    //Must send mail with direcion of frontEnd
    const resetURL = `http://localhost:4000/resetpass/${resetToken}`;
    res.status(200).json({
      success: true,
      data: resetURL,
    });
  } catch (err) {
    next(err);
  }
};

exports.resetPass = async (req, res, next) => {
  const { resetToken } = req.params;
  const { password } = req.body;
  try {
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    const user = await User.findOne({
      where: {
        resetPasswordToken: resetPasswordToken,
        resetPasswordExpire: {
          [Op.gt]: Date.now(),
        },
      },
    });
    console.log(user);
    if (!user) {
      return next(new ErrorResponse("Invalid Token", 400));
    }
    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save();
    res.status(200).json({
      success: true,
      msg: "Password reset successfull",
    });
  } catch (err) {
    next(err);
  }
};

exports.whoami = async (req, res, next) => {
  const user = req.user;
  let token;
  try {
    accessToken = await user.getSignedToken();
  } catch (err) {
    next(err);
  }
  res.status(200).json({
    success: true,
    data: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      image: user.image,
      total: user.total,
    },
    accessToken: accessToken,
  });
};

exports.logout = async (req, res, next) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.jwt)
      return req.status(204).json({
        success: true,
        msg: "Log out successfully",
      });
    const refreshToken = cookies.jwt;
    const foundUser = await User.findOne({
      where: {
        refreshToken,
      },
    });
    if (!foundUser) {
      //deben ir las mismas opciones que en login y register
      res.clearCookie("jwt", {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: "None",
        secure: true,
      });
      return req.status(204).json({
        success: true,
        msg: "Log out successfully",
      });
    }
    foundUser.refreshToken = "";
    await foundUser.save();
    //deben ir las mismas opciones que en login y register
    res.clearCookie("jwt", {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "None",
      secure: true,
    });
    return res.status(204).json({
      success: true,
      msg: "Log out successfully",
    });
  } catch (err) {
    next(err);
  }
};
