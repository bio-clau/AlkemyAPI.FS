const ErrorResponse = require('../utils/errorConstructor');
const {Op} = require('sequelize')
const {v4:uuidv4} = require('uuid')
const {cloudinary} = require('../config/cloudinary');
const crypto = require('crypto')
const User = require('../models/User')

exports.register = async (req, res, next) => {
    const {email, firstName, lastName, password, image} = req.body;
    try {
        if(!email || !firstName || !lastName || !password) {
            next(new ErrorResponse('Missing Fields', 400))
        }
        let result = {}
        if(!image) {
            result = {url:'https://res.cloudinary.com/tropura/image/upload/v1653866106/guest-user_je8e9t.jpg'}
        } else {
            result = await cloudinary.uploader.upload(image);
            if(!result) return next(new ErrorResponse('Image Upload Failed', 503));
        }
        const user = await User.create({
            id:uuidv4(),
            image: result.url,
            email,
            firstName,
            lastName,
            password
        })
        const token = await user.getSignedToken()
        res.status(201).json({
            success:true,
            token: token,
            msg:'User created',
            data: user
        })
    } catch (err) {
        next(err)
    }
}

exports.login = async (req, res, next) => {
    const {email, password} = req.body;
    try {
        const user = await User.findOne({
            where:{
                email:email
            }
        });
        let match
        if(user) {
            match = await user.matchPassword(password)
        } else {
            return next(new ErrorResponse('Invalid Credentials', 401))
        }
        if(!match){
            return next(new ErrorResponse('Invalid Credentials', 401))
        }
        const token = await user.getSignedToken()
        res.status(200).json({
            success:true,
            token: token,
            msg: 'Login successfull',
            data: user
        })
    } catch (err) {
        next(err)
    }
}

exports.forgotPass = async (req, res, next) => {
    const {email} = req.body;
    try {
        if(!email) {
            return next(new ErrorResponse('Invalid Credential', 401))
        }
        const user = await User.findOne({
            where: {
                email:email
            }
        })
        if(!user) {
            return next(new ErrorResponse('Email not found', 404))
        }
        const resetToken = await user.getResetPasswordToken()
        await user.save()
        //Must send mail with direcion of frontEnd
        const resetURL = `http://localhost:4000/resetpass/${resetToken}`
        res.status(200).json({
            success: true,
            data: resetURL
        })
    } catch (err) {
        next(err)
    }
}

exports.resetPass = async (req, res, next) => {
    const {resetToken} = req.params;
    const {password} = req.body;
    try {
        const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        const user = await User.findOne({
            where: {
                resetPasswordToken: resetPasswordToken,
                resetPasswordExpire: {
                    [Op.gt]: Date.now()
                }
            }
        })
        console.log(user)
        if(!user){
            return next(new ErrorResponse('Invalid Token', 400))
        }
        user.password = password;
        user.resetPasswordToken = null;
        user.resetPasswordExpire = null;
        await user.save();
        res.status(200).json({
            success: true,
            msg: 'Password reset successfull'
        })
    } catch (err) {
        next(err)
    }
}