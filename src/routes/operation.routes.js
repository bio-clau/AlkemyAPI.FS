const express = require('express');
const {allOp, addOp, updateOp} = require('../controllers/operation.controllers')
const router = express.Router();

router.route('/allOp/:id').get(allOp)
router.route('/addOp/:id').post(addOp)
router.route('/updateOp/:id').put(updateOp)

module.exports = router;