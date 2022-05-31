const ErrorResponse = require('../utils/errorConstructor');
const Operation = require('../models/Operation')
const User = require('../models/User')
const {v4:uuidv4} = require('uuid')


exports.allOp = async (req, res, next) => {
    //user ID
    const {id} = req.params;
    try {
        const operations = await Operation.findAll({
            where:{
                userId:id
            }
        })
        res.status(200).json({
            success: true,
            msg: "Operations By User",
            data: operations
        })

    } catch (err) {
        next(err)
    }
}

exports.addOp = async (req, res, next) => {
    //user ID
    const {id} = req.params;
    const {typeOp, amount, concept} = req.body;
    try {
        console.log('amount', amount)
        console.log('id', id)
        const user = await User.findByPk(id);
        console.log('user', user)
        if(!user) {
            return next(new ErrorResponse('User Not Found', 404))
        }
        console.log('punto1')
        console.log('total before', user.total)
        if(typeOp === 'income') {
            user.total = user.total + amount
            console.log('suma', user.total)
        }
        if(typeOp === 'expenses') {
            user.total = user.total - amount
        }
        await user.save()
        if(!typeOp || !amount || !concept) {
            return next(new ErrorResponse('Missing Fields', 400))
        }
        const operation = await Operation.create({
            id:uuidv4(),
            typeOp,
            amount,
            concept,
            userId: id
        })

        res.status(201).json({
            success: true,
            msg:'Operation added',
            data: operation
        })
    } catch (err) {
        next(err)
    }
}

exports.updateOp = async (req, res, next) => {
    //operation ID
    const {id} = req.params;
    const {concept} = req.body;
    try {
        if(!concept) {
            return next(new ErrorResponse('Missing Fields', 400))
        }
        const operation = await Operation.findByPk(id);
        if(!operation){
            return next (new ErrorResponse('Operation Not Found', 404));
        }
        operation.concept = concept
        await operation.save()
        res.status(200).json({
            success: true,
            msg: "Updated successfully",
            data: operation
        })
    } catch (err) {
        next(err)
    }
}