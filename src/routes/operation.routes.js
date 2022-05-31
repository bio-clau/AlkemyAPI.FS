const express = require('express');
const {allOp, addOp, updateOp, deleteOp} = require('../controllers/operation.controllers')
const router = express.Router();

router.route('/allOp/:id').get(allOp)
router.route('/addOp/:id').post(addOp)
router.route('/updateOp/:id').put(updateOp)
router.route('/deleteOp/:id').delete(deleteOp)

module.exports = router;