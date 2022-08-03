const orderModel=require("../models/orderModel")
const productModel=require("../models/productModel")
const cartModel=require("../models/cartModel")
const mongoose=require("mongoose")
const validator=require("../utility/validation")

const createOrder=async(req,res)=>{
    try{

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