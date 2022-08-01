const productModel=require("../models/productModel")
const mongoose=require("mongoose")
const validator=require("../utility/validation")
const aws=require("../utility/awsconfig")


var nameRegex=/^[a-zA-Z\s]*$/
var priceRegex=/^[1-9]\d*(\.\d+)?$/
var installmentRegex=/\d/

const createProduct=async (req,res)=>{
  try {
    let data=req.body
    let {title,description,price,currencyId,currencyFormat,style,availableSizes,installments}=data
      
    let objectCreate={}
//-----------------------------------------VALIDATION--------------------------------------------------//
    if(!validator.isValidBody(data))return res.status(400).send({status:false,message : "Please enter some details in the request body"})

    if(!title)return res.status(400).send({status:false,message:"title field is Required"})
    let findtitle = await productModel.findOne({title:title})
    if(findtitle)return res.status(400).send({status:false, message:"This title is already exists"})
    if(nameRegex.test(title)==false)return res.status(400).send({status : false, message :"you entered a invalid Title"})
    objectCreate.title=title

    if(!description)return res.status(400).send({status:false,message:"description field is Required"})
    if(nameRegex.test(description)==false)return res.status(400).send({status : false, message :"you entered a invalid description"})
    objectCreate.description=description

    if(!price)return res.status(400).send({status:false, message:"Price field is Required"})
    if(priceRegex.test(price)==false)return res.status(400).send({status : false, message :"you entered a invalid price"})
    objectCreate.price=price

    if(!currencyId)
    return res.status(400).send({status:false, message:"currencyId field is Required"})
    let checkCurrencyId="INR"
    if(currencyId!=checkCurrencyId)
    return res.status(400).send({status : false, message :"you entered a invalid currencyId---> currencyId should be INR"})
    objectCreate.currencyId=currencyId

    if(!currencyFormat)
    return res.status(400).send({status:false, message:"currencyFormat field is Required"})
    let checkCurrencyFormat="₹"
    if(currencyFormat!=checkCurrencyFormat)
    return res.status(400).send({status : false, message :"you entered a invalid currencyFormat--> currencyFormat should be ₹"})
    objectCreate.currencyFormat=currencyFormat

    let image=req.files
    if(!image || image.length==0)
    return res.status(400).send({status:false,message:"Profile Image field is Required"})
    let productImage=await aws.uploadFile(image[0])
    objectCreate.productImage=productImage

    if(style){
        if(nameRegex.test(style)==false)return res.status(400).send({status:false,message:"STyle to enterd is invalid"})
        objectCreate.style=style
    }


    let checkSizes=["S", "XS","M","X", "L","XXL", "XL"]

    if(!availableSizes)
    return res.status(400).send({status:false,message:"Available Sizes field is Required"})

    let arrayOfSizes=availableSizes.trim().split(",")

    for(let i=0;i<arrayOfSizes.length;i++){
        if(checkSizes.includes(arrayOfSizes[i].trim()))continue;
        else return res.status(400).send({status:false,message:"Sizes should in this ENUM only S/XS/M/X/L/XXL/XL"})
    }
    let newSize=[]
    for(let j=0;j<arrayOfSizes.length;j++){
        if(newSize.includes(arrayOfSizes[j].trim()))continue;
        else newSize.push(arrayOfSizes[j].trim())
    }

    objectCreate.availableSizes=newSize

    if(installments){
        if(installmentRegex.test(installments)==false)return res.status(400).send({status:false,message:"Installment  you entered is invalid"})
        objectCreate.installments=installments
    }
//--------------------------------------------------------------------------------------------------------
    let productCreate= await productModel.create(objectCreate)
    return res.status(201).send({status:true,message:"Document is created successfully",data:productCreate})
}catch(err){
    return res.status(500).send({status:false,message:err.message})
}
}


const getProduct = async function (req, res) {
      try {
        let queryData=req.query
        if(Object.keys(queryData).length==0){
        let filterData= await productModel.find({isDeleted:false})
        return res.status(200).send({status:true,message:`Found ${filterData.length} Items`,data:filterData})
        }
        let objectFilter={isDeleted:false}
        let size=queryData.size
        if(size){
            let checkSizes=["S", "XS","M","X", "L","XXL", "XL"]
            let arraySize=size.split(",")
            for(let i=0;i<arraySize.length;i++){
                if(checkSizes.includes(arraySize[i]))
                continue;
                else
                return res.status(400).send({status:false,message:"Sizes should in this ENUM only S/XS/M/X/L/XXL/XL"})
            }
            objectFilter.availableSizes={}
            objectFilter.availableSizes.$in=arraySize
        }
        let name=queryData.name
        if(name){
            if(!validator.isValid(name))
            return res.status(400).send({status:false,message:"Name should not be empty"})
            name=name.trim()
            if(nameRegex.test(name)==false)
            return res.status(400).send({status:false,message:"You entered invalid Name"})
            objectFilter.title={}
            objectFilter.title.$regex=name
            objectFilter.title.$options="i"
        }
        let priceArray=[]
        let priceGreaterThan=queryData.priceGreaterThan
        if(priceGreaterThan){
            if(!validator.isValid(priceGreaterThan))
            return res.status(400).send({status:false,message:"Name should not be empty"})
            if(priceRegex.test(priceGreaterThan)==false)
            return res.status(400).send({status:false,message:"You entered invalid priceGreaterThan"})
            objectFilter.price={}
            objectFilter.price.$gt=Number(priceGreaterThan)
        }
        let priceLessThan=queryData.priceLessThan
        if(priceLessThan){
            if(!validator.isValid(priceLessThan))
            return res.status(400).send({status:false,message:"Name should not be empty"})
        
            if(priceRegex.test(priceLessThan)==false)
            return res.status(400).send({status:false,message:"You entered invalid priceLessThan"})
    
            let objectKeys=Object.keys(objectFilter)
          
                if(objectKeys.includes("price")){
                    objectFilter.price.$lt=Number(priceLessThan)
                } 
                else{
                objectFilter.price={}
                objectFilter.price.$lt=Number(priceLessThan)
                // console.log(typeof (objectFilter.price.$lt))
               }
        }
        let findFilter= await productModel.find(objectFilter)
        if(findFilter.length==0)
        return res.status(404).send({status:false,message:"No product Found"})
        return res.status(200).send({status:true,message:`${findFilter.length} Matched Found`,data:findFilter})
      } catch (err) {
          res.status(500).send({ status: false, Message: err.Message })
      }
  
  }


const getProductById=async(req,res)=>{
    try{
        let productId=req.params.productId
        if(!mongoose.isValidObjectId(productId))return res.status(400).send({ status: false, message: `${productId} is not a valid userId` })
        const product=await productModel.findOne({_id:productId ,isDeleted:false})
        if(!product)return res.status(404).send({status:false,message:"productId Not found"})
        return res.status(200).send({ status: true, message: 'product details', data: product })
    }catch(error){
        return res.status(500).send({ status: false, message: error.message })
    }
}

const updateProduct=async(req,res)=>{
    try{
        let productId=req.params.productId
        if(!mongoose.isValidObjectId(productId))return res.status(400).send({ status: false, message: `${productId} is not a valid userId` })
        const product=await productModel.findOne({_id:productId ,isDeleted:false})
        if(!product)return res.status(404).send({status:false,message:"productId Not found"})
        if(product.isDeleted==true)return res.status(400).send({status:false,message:"product is deleted"})
        let temp=req.body
        if(!validator.isValidBody(temp))return res.status(400).send({status:false,message:"Please provide something to update"})
        let {title,description,price,currencyId,currencyFormat,isFreeShipping,productImage,style,availableSizes,installments}=temp
        let data={}
//--------------------------------VALIDATION---------------------------------------//
        if(title || title===""){
            title=title.trim()
            if(!validator.isValid(title))return res.status(400).send({status:false, message:"title is empty"})

            let findtitle = await productModel.findOne({title:title})
            if(findtitle)return res.status(400).send({status:false, message:"This title is already exists"})

            if(nameRegex.test(title)==false)return res.status(400).send({status : false, message :"you entered a invalid Title"})
            data.title=title
        }
        if(description||description===""){
            description=description.trim()
            if(!validator.isValid(description))return res.status(400).send({status:false, message:"description is empty"})
            if(nameRegex.test(description)==false)return res.status(400).send({status : false, message :"you entered a invalid description"})
            data.description=description
        }
        if(price||price===""){
            price=price.trim()
            if(!validator.isValid(price))return res.status(400).send({status:false, message:"price is empty"})
            if(priceRegex.test(price)==false)return res.status(400).send({status : false, message :"you entered a invalid price"})
            data.price=price
        }

        if(currencyId||currencyId===""){
            currencyId=currencyId.trim()
            if(!validator.isValid(currencyId))return res.status(400).send({status:false, message:"currencyId is empty"})
            data.currencyId=currencyId
        }
        if(currencyFormat||currencyFormat===""){
            currencyFormat=currencyFormat.trim()
            if(!validator.isValid(currencyFormat))return res.status(400).send({status:false, message:"currencyFormat is empty"})
            data.currencyFormat=currencyFormat
        }
        if(isFreeShipping||isFreeShipping===""){
            isFreeShipping=isFreeShipping.trim()
            if(!validator.isValid(isFreeShipping))return res.status(400).send({status:false, message:"isFreeShipping is empty"})
            if(!/^(true|false)$/.test(isFreeShipping))return res.status(400).send({status:false, message:"Invalid isFreeShipping type"})
            data.isFreeShipping=isFreeShipping
        }
        if(productImage||productImage===""){
            productImage=productImage.trim()
            if(!validator.isValid(productImage))return res.status(400).send({status:false, message:"productImage is empty"})
            await aws.uploadFile(image[0])
            data.productImage=productImage
        }
        if(style||style===""){
            style=style.trim()
            if(!validator.isValid(style))return res.status(400).send({status:false, message:"style is empty"})
            if(nameRegex.test(style)==false)return res.status(400).send({status:false,message:"STyle to enterd is invalid"})
            data.style=style
        }
        if(availableSizes||availableSizes===""){
            availableSizes=availableSizes.trim()
            if(!validator.isValid(availableSizes))return res.status(400).send({status:false, message:"availableSizes is empty"})
            let checkSizes=["S","XS","M","X","L","XXL","XL"]
            let arrayOfSizes=availableSizes.split(',')
            for(let i=0;i<arrayOfSizes.length;i++){
                if(checkSizes.includes(arrayOfSizes[i].trim()))continue;
                else return res.status(400).send({status:false,message:"Sizes should in this ENUM only S/XS/M/X/L/XXL/XL"})}
                let updateSize= await productModel.findOne({_id:productId}).select({_id:0,availableSizes:1})
        let arraySize=updateSize.availableSizes
        for(let i=0;i<arrayOfSizes.length;i++){
            if(arraySize.includes(arrayOfSizes[i].trim()))
            continue;
            
        arraySize.push(arrayOfSizes[i].trim())

    }
            data.availableSizes=arraySize
        }
      
        if(installments||installments===""){
            installments=installments.trim()
            if(!validator.isValid(installments))return res.status(400).send({status:false, message:"installments is empty"})
            if(installmentRegex.test(installments)==false)return res.status(400).send({status:false,message:"Installment  you entered is invalid"})
            data.installments=installments
        }
//----------------------------------------------------------------------------------------
        const updateData=await productModel.findOneAndUpdate({_id:productId,isDeleted:false},{$set:data ,updatedAt:Date.now()},{new:true})
        return res.status(200).send({ status: true, message: "updated successfully", data: updateData })
    }catch(error){
        return res.status(500).send({ status: false, message: error.message })
    }
}

const deleteById=async(req,res)=>{
    try{
        let productId=req.params.productId
        if(!mongoose.isValidObjectId(productId))return res.status(400).send({ status: false, message: `${productId} is not a valid userId` })
        const product=await productModel.findOne({_id:productId , isDeleted:false})
        if(!product)return res.status(404).send({status:false,message:"productId Not found"})
        const updateProduct=await productModel.findOneAndUpdate({_id:productId},{isDeleted: true, deletedAt:new Date()},{new:true}).select({__v:0})
        return res.status(200).send({ status: true, message: 'deleted successfully', data: updateProduct })

    }catch(error){
        return res.status(500).send({ status: false, message: error.message })
    }
}

module.exports={createProduct,getProductById,updateProduct,deleteById,getProduct}
