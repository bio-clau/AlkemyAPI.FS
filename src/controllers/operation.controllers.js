const ErrorResponse = require("../utils/errorConstructor");
const Operation = require("../models/Operation");
const User = require("../models/User");
const { v4: uuidv4 } = require("uuid");

exports.allOp = async (req, res, next) => {
  //user ID
  const { id } = req.params;
  try {
    const operations = await Operation.findAll({
      where: {
        userId: id,
      },
      order: [["date", "DESC"]],
    });
    res.status(200).json({
      success: true,
      msg: "Operations By User",
      data: operations,
    });
  } catch (err) {
    next(err);
  }
};

exports.addOp = async (req, res, next) => {
  //user ID
  const { id } = req.params;
  const { typeOp, amount, concept, date, category } = req.body;
  let subtotal;
  try {
    const user = await User.findByPk(id);
    if (!user) {
      return next(new ErrorResponse("User Not Found", 404));
    }
    if (typeOp === "income") {
      user.total = Number(user.total) + Number(amount);
      subtotal = Number(user.total) + Number(amount);
    }
    if (typeOp === "expenses") {
      user.total = Number(user.total) - Number(amount);
      subtotal = Number(user.total) - Number(amount);
    }
    if (!typeOp || !amount || !concept) {
      return next(new ErrorResponse("Missing Fields", 400));
    }
    let info;
    if (date) {
      info = {
        id: uuidv4(),
        typeOp,
        amount,
        subtotal,
        date,
        concept,
        category,
        userId: id,
      };
    } else {
      info = { id: uuidv4(), typeOp, amount, subtotal, concept, userId: id };
    }
    const operation = await Operation.create(info);
    await user.save();
    const operations = await Operation.findAll({
      where: {
        userId: id,
      },
      order: [["date", "DESC"]],
    });

    res.status(201).json({
      success: true,
      msg: "Operation added",
      data: operations,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateOp = async (req, res, next) => {
  //operation ID
  const { id } = req.params;
  const { concept, category } = req.body;
  try {
    if (!concept || !category) {
      return next(new ErrorResponse("Missing Fields", 400));
    }
    const operation = await Operation.findByPk(id);
    if (!operation) {
      return next(new ErrorResponse("Operation Not Found", 404));
    }
    operation.concept = concept;
    operation.category = category;
    await operation.save();
    const operations = await Operation.findAll({
      where: {
        userId: operation.userId,
      },
      order: [["date", "DESC"]],
    });
    res.status(200).json({
      success: true,
      msg: "Updated successfully",
      data: operations,
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteOp = async (req, res, next) => {
  //operation ID
  const { id } = req.params;
  try {
    const operation = await Operation.findByPk(id);
    const user = await User.findByPk(operation.userId);
    if (operation.typeOp === "income") {
      user.total = user.total - operation.amount;
    }
    if (operation.typeOp === "expenses") {
      user.total = user.total + operation.amount;
    }
    if (!operation) {
      return next(new ErrorResponse("Operation Not Found", 404));
    }
    const result = Operation.destroy({
      where: { id },
    });
    if (result === 0) {
      return next(new ErrorResponse("Deleted Failed", 400));
    }
    await user.save();
    res.status(200).json({
      success: true,
      msg: "Delete successfully",
    });
  } catch (err) {
    next(err);
  }
};
