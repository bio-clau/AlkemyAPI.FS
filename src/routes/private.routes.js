const express = require('express');
const {updateUser, updatePass} = require('../controllers/user.controllers');
const {protect} = require('../middlewares/auth')

const router = express.Router();

router.route('/updateUser/:id').put(protect, updateUser);
router.route('/updatePass/:id').put(updatePass);

module.exports = router;