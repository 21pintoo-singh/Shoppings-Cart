const orderModel=require("../models/orderModel")
const productModel=require("../models/productModel")
const cartModel=require("../models/cartModel")
const userModel=require("../models/userModel")
const mongoose=require("mongoose")
const validator=require("../utility/validation")

const createOrder=async(req,res)=>{
    try{
        let userId=req.params.userId
        if(!mongoose.isValidObjectId(userId))return res.status(400).send({ status: false, message: "userId is invalid" })
        let findUser=await userModel.findOne({userId})
        if(!findUser)return res.status(404).send({ status: false, message: "userId is not found" })
        let data=req.body;
        let objectCreate={}
        if(!validator.isValid(data.cartId))return res.status(400).send({ status: false, message: "cartId is required" })
        if(!mongoose.isValidObjectId(data.cartId))return res.status(400).send({ status: false, message: "CartId is invalid" })
        let findCart=await cartModel.findOne({_id:data.cartId,userId:userId})
        if(!findCart)return res.status(404).send({ status: false, message: "Please create Cart first" })
        if(data.cancellable || data.cancellable===""){
            data.cancellable=data.cancellable.trim()
            if(!validator.isValid(data.cancellable))return res.status(400).send({ status: false, message: "Cancellable is empty" })
            if(!["true","false"].includes(data.cancellable)) return res.status(400).send({status: false, message: "cancellable must be a boolean value"})
            objectCreate.cancellable=data.cancellable
        }
        if(data.status || data.status===""){
            data.status=data.status.trim()
            if(!validator.isValid(data.status))return res.status(400).send({ status: false, message: "Status is empty" })
            let statusEnum=["pending", "completed", "cancled"]
            if(!statusEnum.includes(data.status)) return res.status(400).send({status: false,message: "status must be a pending,completed,canceled"})
            // console.log(data.statusEnum)
            objectCreate.status=data.status
        }
        objectCreate.userId=findCart.userId
        objectCreate.items=findCart.items
        objectCreate.totalPrice=findCart.totalPrice
        objectCreate.totalItems=findCart.totalItems
        let itemArr=findCart.items
        let sum=0
        for(let i of itemArr){
            sum+=i.quantity
        }
        objectCreate.totalQuantity=sum
        // console.log(objectCreate)
        const orderCreated=await orderModel.create(objectCreate)
        return res.status(201).send({ status: true, message: "Success", data: orderCreated})

    }catch(error){
        return res.status(500).send({status:false,message:error.message})
    }
}

const updateOrder=async(req,res)=>{
    try{

    }catch(error){
        return res.status(500).send({status:false,message:error.message})
    }
}

module.exports={createOrder,updateOrder}