const userModel=require('../models/userModel.js')
const productModel=require('../models/productModel.js')
const cartModel=require('../models/cartModel.js')
const mongoose=require('mongoose')
const validator=require('../utility/validation.js')

var quantityRegex=/^\d*[1-9]\d*$/

let createCart = async (req, res) => {

    try {
        let userId = req.params.userId
        if (!mongoose.isValidObjectId(userId))return res.status(400).send({ status: false, message: "invalid UserId" })
        let findUserId = await userModel.findOne({ _id: userId })
        if (!findUserId)return res.status(404).send({ status: false, message: "No user found" })
        //authorization
        if (userId != req.tokenData.userId) return res.status(401).send({ status: false, Message: "Unauthorized user!" })

        let data = req.body

        let objectCreate = {}

        let findCart = await cartModel.findOne({ userId: userId })
    
        objectCreate.userId = userId

        if (!findCart) {
            let productId = data.productId
            if (!productId)return res.status(400).send({ status: false, message: "productId field is Required..." })

            if (!mongoose.isValidObjectId(productId))return res.status(400).send({ status: false, message: "You entered an invalid productId" })

            let findProduct = await productModel.findOne({ _id: productId, isDeleted: false })
            if (!findProduct)return res.status(404).send({ status: false, message: "No product found" })

            if (!data.quantity)return res.status(400).send({ status: false, message: "quantity field is Required..." })

            if (quantityRegex.test(data.quantity) == false)return res.status(400).send({ status: false, message: "quantity should be above 0.. and should be positive integer only." })

            objectCreate.items = []
            let objectPush = {}
            objectPush.productId = productId
            objectPush.quantity = data.quantity

            objectCreate.items.push(objectPush)

            let totalPrice = (data.quantity) * (findProduct.price)
            objectCreate.totalPrice = totalPrice
            let totalItems = objectCreate.items.length
            objectCreate.toalItems = totalItems
            
            let createNewCart = await cartModel.create(objectCreate)
            let addData= await cartModel.findOne({userId:userId}).select({items:{_id:0}}).populate([{path :"items.productId"}])
            return res.status(201).send({ status: false, message: "Cart is successfully created", data: addData })

        }else {
            let productId = data.productId
            if (!productId)
                return res.status(400).send({ status: false, message: "productId field is Required..." })

            if (!mongoose.isValidObjectId(productId))
                return res.status(400).send({ status: false, message: "You entered an invalid productId" })

            let findProduct = await productModel.findOne({ _id: productId, isDeleted: false })
            if (!findProduct)return res.status(404).send({ status: false, message: "No product found" })

            if (!data.quantity)return res.status(400).send({ status: false, message: "quantity field is Required..." })
            if (quantityRegex.test(data.quantity) == false)return res.status(400).send({ status: false, message: "quantity should be above 0.. and should be positive integer only." })

            for (let i = 0; i < findCart.items.length; i++) {
                if (findCart.items[i].productId == productId) {
                    let checkPrice = findProduct.price
                    findCart.items[i].quantity += Number(data.quantity)
                    findCart.totalPrice = findCart.totalPrice + (Number(data.quantity) * checkPrice)
                    findCart.totalItems = findCart.items.length

                    let updateCartForSameProductId = await cartModel.findOneAndUpdate({userId: userId }, { $set: findCart }, { new: true }).select({items:{_id:0}}).populate([{path:"items.productId"}])
                    return res.status(200).send({ status: true, message: "product added successfully", data: updateCartForSameProductId })
                } else continue;
            }
            objectCreate.items = findCart.items
            let pushObject = {}
            pushObject.productId = productId
            pushObject.quantity = data.quantity
            objectCreate.items.push(pushObject)
            let initialPrice = findCart.totalPrice
            let finalPrice = (data.quantity * findProduct.price) + initialPrice
            objectCreate.totalPrice = finalPrice
            objectCreate.totalItems = objectCreate.items.length
            let addNewCart = await cartModel.findOneAndUpdate({userId: userId }, { $set: objectCreate }, { new: true }).select({items:{_id:0}}).populate([{path:"items.productId"}])
            return res.status(200).send({ status: false, message: "Cart is added successfully", data: addNewCart })
        }
    }catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }

}

const updateCart=async(req,res)=>{
    try{
        //User validation
        let userId = req.params.userId
        if (!mongoose.isValidObjectId(userId))return res.status(400).send({ status: false, message: "invalid UserId" })
        let findUserId = await userModel.findOne({ _id: userId })
        if (!findUserId)return res.status(404).send({ status: false, message: "No user found" })
        //authorization
        if (userId != req.tokenData.userId) return res.status(401).send({ status: false, Message: "Unauthorized user!" })

        let data = req.body
        let { cartId, productId, removeProduct } = data

        //Cart Validation
        if (!cartId)return res.status(400).send({ status: false, message: "cartId is required" })
        if (!mongoose.isValidObjectId(cartId))return res.status(400).send({ status: false, message: "cartId is invalid" })
        let findCart = await cartModel.findOne({ _id: cartId, userId: userId })
        if (!findCart)return res.status(404).send({ status: false, message: "No cart found" })

        //product validation
        if (!productId)return res.status(400).send({ status: false, message: "productId is required" })
        if (!mongoose.isValidObjectId(productId))return res.status(400).send({ status: false, message: "productId is invalid" })
        let findProduct = await productModel.findById(productId)
        if (!findProduct)return res.status(404).send({ status: false, message: "No product found with respect to this productId" })

        //removeProduct validation
        if (!removeProduct) {return res.status(200).send({ status: true, data: findCart })
        }else {
            if (removeProduct == 0) {
                for (let i = 0; i < findCart.items.length; i++) {
                    if (findCart.items[i].productId == productId) {

                        let quantityCalculate = findCart.items[i].quantity
                        let checkPrice = findProduct.price
                        let totalPrice = findCart.totalPrice - (checkPrice * quantityCalculate)

                        findCart.items.splice(i, 1)

                        findCart.totalPrice = totalPrice
                        findCart.totalItems = findCart.items.length
                    } else
                        continue;
                }

            } else if (removeProduct == 1) {
                for (let j = 0; j < findCart.items.length; j++) {
                    if (findCart.items[j].productId == productId) {

                        let checkQuantity = findCart.items[j].quantity
                        let checkPrice = findProduct.price
                        let totalPrice = findCart.totalPrice - (checkPrice * checkQuantity)

                        if (checkQuantity == 1) {
                            findCart.items.splice(j, 1)
                            findCart.totalPrice = totalPrice
                            findCart.totalItems = findCart.items.length
                        } else {
                            let newQuantity = checkQuantity - 1
                            let totalPrice1 = totalPrice + (checkPrice * newQuantity)
                            findCart.items[j].quantity = newQuantity
                            findCart.totalPrice = totalPrice1
                            findCart.totalItems = findCart.items.length
                        }
                    }
                }
            } else {
                return res.status(400).send({ status: false, message: "you have entered an invalid input of removeProduct--> it should be only 0 or 1" })
            }
        }
        let updateData = await cartModel.findOneAndUpdate({ _id: cartId, userId: userId }, { $set: findCart }, { new: true })
        return res.status(200).send({ status: false, message: "success", data: updateData })
    }catch(err){
        return res.status(500).send({status:false,message:err.message})
    }
}

const getById=async(req,res)=>{
    try{
        //User validation
        let userId = req.params.userId
        if (!mongoose.isValidObjectId(userId))return res.status(400).send({ status: false, message: "invalid UserId" })
        let findUserId = await userModel.findOne({ _id: userId })
        if (!findUserId)return res.status(404).send({ status: false, message: "No user found" })
        //authorization
        if (userId != req.tokenData.userId) return res.status(401).send({ status: false, Message: "Unauthorized user!" })


        let checkCart=await cartModel.findOne({userId}).populate([{ path: "items.productId" }])
        
        if(!checkCart)return res.status(404).send({status:false,message:"Cart not exist for this userId"})
        return res.status(200).send({status: true,message: "Success",data: checkCart})  
    }catch(err){
        return res.status(500).send({status:false,message:err.message})
    }
}

const deleteById=async(req,res)=>{
    try{
        //user Validation
        let userId = req.params.userId
        if (!mongoose.isValidObjectId(userId))return res.status(400).send({ status: false, message: "invalid UserId" })
        let findUserId = await userModel.findOne({ _id: userId })
        if (!findUserId)return res.status(404).send({ status: false, message: "No user found" })
        //authorization
        if (userId != req.tokenData.userId) return res.status(401).send({ status: false, Message: "Unauthorized user!" })

        let checkCart=await cartModel.findOne({userId})
        if(!checkCart)return res.status(404).send({status:false,message:"Cart not exist for this userId"})
        let deleteCart=await cartModel.findOneAndUpdate({userId},{items:[] ,totalItems:0 , totalPrice:0},{new:true})
        return res.status(204).send({status: true,message: "Success",data: deleteCart}) 

    }catch(err){
        return res.status(500).send({status:false,message:err.message})
    }
}

module.exports={createCart,getById,deleteById,updateCart}