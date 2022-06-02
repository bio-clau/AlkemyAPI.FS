const express = require('express');
const {updateUser, updatePass} = require('../controllers/user.controllers');
const {whoami} = require('../controllers/credentials.controllers')
const {protect} = require('../middlewares/auth')

const router = express.Router();

router.route('/updateUser/:id').put(protect, updateUser);
router.route('/updatePass/:id').put(updatePass);
router.route('/whoami').get(protect, whoami);

module.exports = router;