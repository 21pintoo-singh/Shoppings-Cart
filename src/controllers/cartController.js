const cartModel = require('../models/cartModels')
const productModel = require('../models/productModels')
const vfy = require('../utility/validation')

/*---------------------- create cart ----------------------*/

const create = async (req, res) => {
    try {

        // get body here
        const data = req.body
        const userId = req.params.userId

        // check body validation
        if (vfy.isEmptyObject(data)) return unsuccess(res, 400, ' Post Body is empty, Please add some key-value pairs')

        // destructure data here
        let { productId, quantity, cartId } = data

        // if quantity does't exist then add 1 default
        quantity = quantity || 1;

        // basic validations
        // validate products
        if (vfy.isEmptyVar(productId)) return unsuccess(res, 400, ' ProductId must be required!')
        if (!vfy.isValidObjectId(productId)) return unsuccess(res, 400, ' Invalid ProductId!')

        // validate quantity
        if (isNaN(quantity)) return unsuccess(res, 400, 'Quantity must be required!')
        if (typeof quantity != 'number') return unsuccess(res, 400, ' Quantity must be a number!')
        if (Number(quantity) < 1) return unsuccess(res, 400, ' Quantity value is > 1 !')


        // is a valid id 
        if (!vfy.isValidObjectId(userId)) return unsuccess(res, 400, ' Invalid userId !')

        // check broduct exist or not;
        const product = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!product) return unsuccess(res, 404, ' productId not found!')

        // check if the cart is already exist or not
        const cart = await cartModel.findOne({ userId })
        if (cart) {

            // validate cartID
            if (vfy.isEmptyVar(cartId)) return unsuccess(res, 400, ' CartId must be required!')
            if (!vfy.isValidObjectId(cartId)) return unsuccess(res, 400, ' Invalid cartId !')

            // check both cartid's from req.body and db cart are match or not?
            if (cart._id != cartId) return unsuccess(res, 400, ' CartId does\'t belong to this user!')

            // we neeed to check if the item already exist in my item's list or NOT!!
            let index = -1;
            for (let i = 0; i < cart.items.length; i++) {
                if (cart.items[i].productId == productId) {
                    index = i
                    break
                }
            }

            // now we need to add item
            if (index >= 0) {
                cart.items[index].quantity = cart.items[index].quantity + quantity
            } else {
                cart.items.push({ productId, quantity })
            }

            // update prise
            let total = cart.totalPrice + (product.price * quantity)
            cart.totalPrice = Math.round(total * 100) / 100

            // update quantity
            cart.totalItems = cart.items.length

            // update cart
            await cart.save()
            return success(res, 201, cart, '✅ Item added successfully and Cart updated!',)
        }

        // round OFF total
        let total = product.price * quantity
        total = Math.round(total * 100) / 100

        // need to create new cart here 
        const object = {
            userId,
            items: [{ productId, quantity }],
            totalPrice: total,
            totalItems: 1
        }

        const createCart = await cartModel.create(object)
        return success(res, 201, createCart, '✅ Item added successfully and New cart created!')

    } catch (_) {
        console.log(_)
        unsuccess(res, 500, `⚠️ Error: ${_.message}`)
    }
}



/*---------------------- update cart ----------------------*/

const update = async (req, res) => {
    try {
        // get body here
        const data = req.body
        const userId = req.params.userId

        // check body validation
        if (vfy.isEmptyObject(data)) return unsuccess(res, 400, ' Post Body is empty, Please add some key-value pairs')

        // destructure data here
        let { productId, cartId, removeProduct } = data

        // basic validations
        // validate products
        if (vfy.isEmptyVar(productId)) return unsuccess(res, 400, ' ProductId must be required!')
        if (!vfy.isValidObjectId(productId)) return unsuccess(res, 400, ' Invalid ProductId!')

        // validate quantity
        if (isNaN(removeProduct)) return unsuccess(res, 400, ' removeProduct must be required!')
        if (typeof removeProduct != 'number') return unsuccess(res, 400, ' removeProduct must be a number!')

        // 👉 if you want, like removeProduct = 2 then remove quantity by 2 for that comment ⬇️ line
        if (removeProduct < 0 || removeProduct > 1) return unsuccess(res, 400, ' removeProduct value is only 0 and 1 !')

        // is a valid id 
        if (!vfy.isValidObjectId(userId)) return unsuccess(res, 400, ' Invalid userId !')

        // check broduct exist or not;
        const product = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!product) return unsuccess(res, 404, ' productId not found!')

        // validate cartID
        if (vfy.isEmptyVar(cartId)) return unsuccess(res, 400, ' CartId must be required!')
        if (!vfy.isValidObjectId(cartId)) return unsuccess(res, 400, ' Invalid cartId !')

        // check if the cart is already exist or not
        const cart = await cartModel.findOne({ userId })
        if (!cart) return unsuccess(res, 404, ' Cart not found!')

        // check both cartid's from req.body and db cart are match or not?
        if (cart._id != cartId) return unsuccess(res, 400, ' CartId does\'t belong to this user!')

        // we neeed to check if the item already exist in my item's list or NOT!!
        let index = -1;
        for (let i = 0; i < cart.items.length; i++) {
            if (cart.items[i].productId == productId) {
                index = i
                break
            }
        }

        // now we need to add item
        if (index >= 0) {
            if (cart.items[index].quantity < removeProduct) return unsuccess(res, 400, ` Can't remove, please provide removeProduct <= ${cart.items[index].quantity} !`)
        } else {
            return unsuccess(res, 400, ` this item you trying to remove is does't exist in your cart`)
        }
        // remove item(s) 1 or all
        if (removeProduct == 0) {

            // update prise
            let total = cart.totalPrice - (product.price * cart.items[index].quantity)
            cart.totalPrice = Math.round(total * 100) / 100
            cart.items.splice(index, 1) //remove full item
        } else {

            // update prise
            let total = cart.totalPrice - (product.price * removeProduct)
            cart.totalPrice = Math.round(total * 100) / 100
            if (cart.items[index].quantity == removeProduct) {
                cart.items.splice(index, 1) //remove full item
            } else {
                cart.items[index].quantity = cart.items[index].quantity - removeProduct
            }
        }

        // update quantity
        cart.totalItems = cart.items.length

        // update cart
        await cart.save()
        return success(res, 200, cart, `✅ You just ${removeProduct == 0 ? 'remove an item from your cart' : 'decress quantity by ' + removeProduct} !`,)

    } catch (_) {
        console.log(_)
        unsuccess(res, 500, `⚠️ Error: ${_.message}`)
    }
}


//-------------------------------------------Get cart---------------------

const getCart = async function (req, res) {
    try {
        const userId = req.params.userId

        // authroization is being checked through Auth(Middleware)
        const checkCart = await cartModel.findOne({ userId: userId }) //.populate('items.productId')
        if (!checkCart) { return res.status(404).send({ status: false, Message: 'cart not found ' }) }

        res.status(200).send({ status: true, Message: 'sucess ', data: checkCart })
    } catch (error) { res.status(500).send({ status: false, Message: error.message }) }
}

//------------------------------------Delete cart-----------------------

const deleteCart = async function (req, res) {
    try {
        const userId = req.params.userId

        // authroization is being checked through Auth(Middleware)
        const checkCart = await cartModel.findOne({ userId: userId })
        if (!checkCart) { return res.status(400).send({ status: false, Message: 'cart not found ' }) }
        await cartModel.findOneAndUpdate({ userId: userId }, { items: [], totalPrice: 0, totalItems: 0 })
        res.status(200).send({ status: true, Message: 'sucessfully deleted' })
    } catch (error) { res.status(500).send({ status: false, Message: error.message }) }
}

//--------------------
const success = (res, statusCode, Data, Message) => {
    return res.status(statusCode).send({ status: true, Message: Message, data: Data })
}

const unsuccess = (res, statusCode, Message) => {
    return res.status(statusCode).send({ status: !true, Message: Message })
}

module.exports = { create, update, getCart, deleteCart }