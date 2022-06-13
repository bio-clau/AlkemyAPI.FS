const express = require('express');
const {updateUser, updatePass, refreshToken} = require('../controllers/user.controllers');
const {whoami, logout} = require('../controllers/credentials.controllers')
const {protect} = require('../middlewares/auth')

const router = express.Router();

router.route('/updateUser/:id').put(protect, updateUser);
router.route('/updatePass/:id').put(protect, updatePass);
router.route('/refreshToken').get(protect, refreshToken);
router.route('/logout').get(protect, logout);
router.route('/whoami').get(protect, whoami);

module.exports = router;