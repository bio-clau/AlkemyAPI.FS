const express = require("express");
const {
  allOp,
  addOp,
  updateOp,
  deleteOp,
} = require("../controllers/operation.controllers");
const { protect } = require("../middlewares/auth");
const router = express.Router();

router.route("/allOp/:id").get(protect, allOp);
router.route("/addOp/:id").post(protect, addOp);
router.route("/updateOp/:id").put(protect, updateOp);
router.route("/deleteOp/:id").delete(protect, deleteOp);

module.exports = router;
