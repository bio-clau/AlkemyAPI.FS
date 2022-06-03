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
    let subtotal
    try {
        const user = await User.findByPk(id);
        if(!user) {
            return next(new ErrorResponse('User Not Found', 404))
        }
        if(typeOp === 'income') {
            user.total = user.total + amount
            subtotal = user.total + amount
        }
        if(typeOp === 'expenses') {
            user.total = user.total - amount
            subtotal = user.total - amount
        }
        await user.save()
        if(!typeOp || !amount || !concept) {
            return next(new ErrorResponse('Missing Fields', 400))
        }
        const operation = await Operation.create({
            id:uuidv4(),
            typeOp,
            amount,
            subtotal,
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

exports.deleteOp = async (req, res, next) => {
    //operation ID
    const {id} = req.params;
    try {
        const operation = await Operation.findByPk(id)
        const user = await User.findByPk(operation.userId)
        if(operation.typeOp === 'income'){
            user.total = user.total-operation.amount
        }
        if(operation.typeOp === 'expenses'){
            user.total = user.total+operation.amount
        }
        if(!operation) {
            return next(new ErrorResponse('Operation Not Found', 404))
        }
        const result = Operation.destroy({
            where:{id}
        })
        if(result === 0) {
            return next(new ErrorResponse('Deleted Failed', 400))
        }
        await user.save();
        res.status(200).json({
            success: true,
            msg: 'Delete successfully'
        })
    } catch (err) {
        next(err)
    }

}