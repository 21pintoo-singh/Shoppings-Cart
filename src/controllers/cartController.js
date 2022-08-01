const userModel=require('../models/userModel.js')
const productModel=require('../models/productModel.js')
const cartModel=require('../models/cartModel.js')
const mongoose=require('mongoose')
const validator=require('../utility/validation.js')

var quantityRegex=/^\d*[1-9]\d*$/

let createCart = async (req,res)=>{
   
    try {

    let userId=req.params.userId

    if(!mongoose.isValidObjectId(userId))
    return res.status(400).send({status:false,message:"You entered an invalid UserId"})

    let findUserId= await userModel.findOne({_id:userId})
    if(!findUserId)
    return res.status(404).send({status:false,message:"No user found"})

    let data=req.body

    let objectCreate={}

     let cartId=data.cartId

    // if(!mongoose.isValidObjectId(cartId))
    // return res.status(400).send({status:false,message:"You entered an invalid cartId"})

    if(!cartId){
    let findCart= await cartModel.findOne({userId:userId})
    objectCreate.userId=userId
    if(findCart)
    return res.status(200).send({status:true,message:"cart is created already please enter cartId ........."})
    if(!findCart){
        let productId=data.productId
        if(!productId)
        return res.status(400).send({status:false,message:"productId field is Required..."})

    if(!mongoose.isValidObjectId(productId))
    return res.status(400).send({status:false,message:"You entered an invalid productId"})

    let findProduct= await productModel.findOne({_id:productId,isDeleted:false})
    if(!findProduct)
    return res.status(404).send({status:false, message:"No product found"})

    if(!data.quantity)
    return res.status(400).send({status:false,message:"quantity field is Required..."})

    if(quantityRegex.test(data.quantity)==false)
    return res.status(400).send({status:false,message:"quantity should be above 0.. and should be positive integer only."})

    objectCreate.items=[]
    let objectPush={}
    objectPush.productId=productId
    objectPush.quantity=data.quantity

    objectCreate.items.push(objectPush)
    // objectCreate.items.push({})
    // objectCreate.items[0].productId=productId
    // objectCreate.items[0].quantity=data.quantity


    let totalPrice=(data.quantity)*(findProduct.price)
    objectCreate.totalPrice=totalPrice

    let totalItems=objectCreate.items.length
    objectCreate.toalItems=totalItems

    let createNewCart= await cartModel.create(objectCreate)
    
    return res.status(201).send({status:false,message:"Cart is successfully created",data:createNewCart})

    }
        }

    else {

        if(!mongoose.isValidObjectId(cartId))
        return res.status(400).send({status:false,message:"You entered an invalid cartId"})

       let findCart= await cartModel.findOne({_id:cartId,userId:userId})
       
       if(!findCart) 
       return res.status(404).send({status:false,message:"No cart found"})

       objectCreate.userId=userId

        let productId=data.productId
        if(!productId)
        return res.status(400).send({status:false,message:"productId field is Required..."})

    if(!mongoose.isValidObjectId(productId))
    return res.status(400).send({status:false,message:"You entered an invalid productId"})

    let findProduct= await productModel.findOne({_id:productId,isDeleted:false})
    if(!findProduct)
    return res.status(404).send({status:false, message:"No product found"})

    if(!data.quantity)
    return res.status(400).send({status:false,message:"quantity field is Required..."}) 
    if(quantityRegex.test(data.quantity)==false)
    return res.status(400).send({status:false,message:"quantity should be above 0.. and should be positive integer only."})
    for(let i=0;i<findCart.items.length;i++){
        if(findCart.items[i].productId==productId){
            let checkPrice=findProduct.price
            findCart.items[i].quantity+=Number(data.quantity)
            findCart.totalPrice=findCart.totalPrice+(Number(data.quantity)*checkPrice)
            findCart.totalItems=findCart.items.length

            let updateCartForSameProductId=await cartModel.findOneAndUpdate({_id:cartId,userId:userId},{$set:findCart},{new:true}).select({items:{_id:0}})
            return res.status(200).send({status:true,message:"product added successfully",data:updateCartForSameProductId})

        } else continue;

    }

    
    objectCreate.items=findCart.items
    let pushObject={}
    pushObject.productId=productId
    pushObject.quantity=data.quantity
    objectCreate.items.push(pushObject)
   

    let initialPrice=findCart.totalPrice
    let finalPrice=(data.quantity*findProduct.price)+initialPrice
    objectCreate.totalPrice=finalPrice
    objectCreate.totalItems=objectCreate.items.length



    let addNewCart= await cartModel.findOneAndUpdate({_id:cartId,userId:userId},{$set:objectCreate},{new:true})

    return res.status(200).send({status:false,message:"Cart is added successfully",data:addNewCart})
    }
}

catch(err){
    return res.status(500).send({status:false,message:err.message})
}

}
// const createCart=async(req,res)=>{
//     let userId=req.params.userId
//     if(!mongoose.isValidObjectId(userId))return res.status(400).send({status:false,message:"You entered an invalid userId"})
//     let data=req.body
//     if(!validator.isValidBody(data))return res.status(400).send({ status: false, message: "Please provide cart details" })
//     let {productId, cartId }=data
//     if(!validator.isValid(productId)) return res.status(400).send({status: true,message: "productId is required in the request body"})
//     if(!mongoose.isValidObjectId(productId))return res.status(400).send({status:false,message:"Invalid productId"})
//     if(cartId){
//         if(!validator.isValid(cartId))return res.status(400).send({status: true,message: "cartId is required in the request body"})
//         if(!mongoose.isValidObjectId(cartId))return res.status(400).send({status:false,message:"Invalid cartId"})
//         let checkProduct=await productModel.findOne({_id:productId,isDeleted:false})
//         if(!checkProduct)return res.status(404).send({ status: true, message: "product not exist or already deleted" })
//     }
// }


//if checkproduct.installment==0 return false
//chekc userid cart
//if cart==null{
// cartmodel.create({userid,blankcart})
//product data=>new object (product id && product quantity)
//cart data=>new object [{product data}]
//cart update=>findoneandUpdate({userid},{},{}).select({items:{_id:0}})
//return res.send
//}
//cart==already created
/*

*/




const updateCart=async(req,res)=>{
    try{

    }catch(err){
        return res.status(500).send({status:false,message:err.message})
    }
}

const getById=async(req,res)=>{
    try{
        let userId=req.params.userId
        if(!mongoose.isValidObjectId(userId))return res.status(400).send({status:false,message:"You entered an invalid userId"})
        let checkCart=await cartModel.findOne({userId})
        if(!checkCart)return res.status(404).send({status:false,message:"Cart not exist for this userId"})
        return res.status(200).send({status: true,message: "Success",data: checkCart})  
    }catch(err){
        return res.status(500).send({status:false,message:err.message})
    }
}

const deleteById=async(req,res)=>{
    try{
        let userId=req.params.userId
        if(!mongoose.isValidObjectId(userId))return res.status(400).send({status:false,message:"You entered an invalid userId"})
        let checkCart=await cartModel.findOne({userId})
        if(!checkCart)return res.status(404).send({status:false,message:"Cart not exist for this userId"})
        let deleteCart=await cartModel.findOneAndUpdate({userId},{items:[] ,totalItems:0 , totalPrice:0},{new:true})
        return res.status(200).send({status: true,message: "Success",data: deleteCart}) 

    }catch(err){
        return res.status(500).send({status:false,message:err.message})
    }
}

module.exports={createCart,getById,deleteById,updateCart}