const express = require('express');
const {register, login, forgotPass, resetPass} = require('../controllers/credentials.controllers')

const router = express.Router();

router.route('/register').post(register)
router.route('/login').post(login)
router.route('/forgotPass').post(forgotPass)
router.route('/resetPass/:resetToken').put(resetPass)

module.exports = router;