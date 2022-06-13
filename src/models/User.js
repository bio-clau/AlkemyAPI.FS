const { DataTypes, UUID } = require("sequelize");
const db = require("../config/db.js");
const Operation = require("./Operation");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = db.sequelize.define("users", {
  id: {
    type: UUID,
    primaryKey: true,
  },
  image: {
    type: DataTypes.STRING,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM("2781", "1190"),
    defaultValue: "2781",
  },
  password: {
    type: DataTypes.STRING,
    // allowNull: false,
  },
  total: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  resetPasswordToken: {
    type: DataTypes.STRING,
  },
  resetPasswordExpire: {
    type: DataTypes.DATE,
  },
  refreshToken: {
    type: DataTypes.STRING,
  },
});

User.beforeCreate(async (user) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPass = await bcrypt.hash(user.password, salt);
  user.password = hashedPass;
});
User.beforeUpdate(async (user) => {
  if (user.changed("password")) {
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(user.password, salt);
    user.password = hashedPass;
  }
});

User.prototype.matchPassword = async function (pass) {
  return await bcrypt.compare(pass, this.password);
};

User.prototype.getSignedToken = async function () {
  return jwt.sign(
    {
      UserInfo: {
        id: this.id,
        role: this.role,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE,
    }
  );
};

User.prototype.getRefreshToken = async function () {
  return jwt.sign({ id: this.id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "1d",
  });
};

User.prototype.getResetPasswordToken = async function () {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpire = Date.now() + 10 * (60 * 1000);
  return resetToken;
};

User.hasMany(Operation, {
  foreignKey: "userId",
  sourceKey: "id",
});

Operation.belongsTo(User, {
  foreignKey: "userId",
  targetKey: "id",
});

module.exports = User;
