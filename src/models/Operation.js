const { DataTypes, UUID } = require("sequelize");
const db = require("../config/db");

const Operation = db.sequelize.define("operations", {
  id: {
    type: UUID,
    primaryKey: true,
  },
  typeOp: {
    type: DataTypes.ENUM("income", "expenses"),
    allowNull: false,
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  concept: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = Operation;
