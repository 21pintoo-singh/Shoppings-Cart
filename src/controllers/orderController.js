const orderModel = require('../models/orderModel')
const cartModel = require('../models/cartModels')
const userModel = require('../models/userModel')
const vfy = require('../utility/validation')

const createOrder = async function (req, res) {

    try {
        let requestBody = req.body;
        const userId = req.params.userId

        // 👍 Authroization is being checked through Auth(Middleware)

        const { cartId, cancellable } = requestBody
        if (vfy.isEmptyObject(requestBody)) { return res.status(400).send({ status: false, Message: ' Please provide Post Body' }); }

        let findUser = await userModel.findOne({ userId })
        if (!findUser) return res.status(404).send({ status: false, message: "userId is not found" })


        if (vfy.isEmptyVar(cartId)) { return res.status(400).send({ status: false, Message: ' Please provide cartId' }) }
        if (!vfy.isValidObjectId(cartId)) { return res.status(400).send({ status: false, Message: ' Please provide a valid cartId' }) }

        // use userid to find cart
        const cart = await cartModel.findOne({ userId })
        if (!cart) return res.status(404).send({ status: false, Message: ' user\'s cart unavailable' })
        if (cart._id != cartId) return res.status(400).send({ status: false, Message: ' Cart id doesn\'t belong to this user' })

        // get cart info like items, totalPrice, totalItems and totalQuantity
        let { items, totalPrice, totalItems } = cart
        let totalQuantity = 0;
        items.forEach(each => totalQuantity += each.quantity);

        // object that use to create order
        const Obj = { userId, items, totalPrice, totalItems, totalQuantity, cancellable }

        const createProduct = await orderModel.create(Obj);

        res.status(201).send({ status: true, Message: '✅ sucesfully created order', data: createProduct })

    } catch (error) { res.status(500).send({ status: false, Message: error.message }) }
}
//-----------------------------#Put Api--------------------------
const updateOrder = async function (req, res) {
    const userId = req.params.userId
    const requestBody = req.body
    // 👍 Authroization is being checked through Auth(Middleware)

    let { orderId, status } = requestBody
    if (vfy.isEmptyObject(requestBody)) { return res.status(400).send({ status: false, Message: ' Invalid request Body' }) }

    let findUser = await userModel.findById(userId)
    if (!findUser)
        return res.status(404).send({ status: false, message: "No such User found" })

    if (vfy.isEmptyVar(orderId)) { return res.status(400).send({ status: false, Message: ' Please provide orderId' }) }
    if (!vfy.isValidObjectId(userId)) { return res.status(400).send({ status: false, Message: ' Please provide valid userId through Params' }) }
    if (!vfy.isValidObjectId(orderId)) { return res.status(400).send({ status: false, Message: ' Please provide valid orderId' }) }
    if (!orderId) { return res.status(400).send({ status: false, Message: `Order does not exist for ${orderId}` }) }
    if (vfy.isEmptyVar(status)) { return res.status(400).send({ status: false, Message: ' Status required' }) }
    if (!["pending", "completed", "canceled"].includes(status)) { return res.status(400).send({ status: false, Message: ' Status should be only ["pending", "completed", "canceled"]' }) }



    const userByOrder = await orderModel.findOne({ _id: orderId, userId })
    if (!userByOrder) { return res.status(400).send({ status: false, Message: `Order does not exist for ${userId}` }) }

    if (status == "canceled") {
        if (!userByOrder.cancellable) { return res.status(400).send({ status: false, Message: "This order camn't be cancelled because it is not allowed(cancellable=false)" }) }
    }
    // if (userByOrder["status"] == "completed") { return res.status(400).send({ status: false, Message: "This order is already compleated so you can't update it's status" }) }

    const updateOrder = await orderModel.findOneAndUpdate({ _id: orderId, userId }, { $set: { status } }, { new: true })
    return res.status(200).send({ status: true, data: updateOrder, Message: " Order updated successfully" })
}

module.exports = { createOrder, updateOrder }