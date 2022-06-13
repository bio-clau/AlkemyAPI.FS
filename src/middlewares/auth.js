//middleware protect
const jwt = require('jsonwebtoken');
const ErrorResponse = require('../utils/errorConstructor');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if(!token) {
        return next(new ErrorResponse('Not Authorized', 401));
    }
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findByPk(decoded.UserInfo.id);
        if(!user) {
            return next(new ErrorResponse('User Not Found', 404))
        }
        req.user = user;
        req.roles = decoded.UserInfo.role
        next()
    } catch (err) {
        next(new ErrorResponse('Must login', 401))
    }
}