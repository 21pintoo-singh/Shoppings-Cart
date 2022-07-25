const userModel=require("../models/userModels")
const bcrypt=require("bcrypt")
const validator=require("../utility/validation")
const aws=require("../utility/awsconfig")
const mongoose=require("mongoose")
const ObjectId=mongoose.Types.ObjectId

const validEmail=/^[a-zA-Z0-1]+[@][a-z]{3,6}[.][a-z]{2,5}$/
const validPhone=/^[6789][0-9]{9}$/
const validFName=/^[a-zA-Z]+$/ 
const validLName=/^[a-zA-Z]+$/

const createUser=async (req,res)=>{
    try{
        let files = req.files;
        const requestBody=req.body
        // console.log(requestBody)
        if(!validator.isValidBody(requestBody))return res.status(400).send({ status: false, message: 'Please provide user details' })

        let { fname, lname, phone, email, password, address } = requestBody// Object destructing
        // console.log(fname)
        // console.log(requestBody)
        let ad=JSON.parse(address)
        requestBody.address=ad
        // console.log(address)
//----------------------------------Validation starts--------------------------------
        //fname
        if(!validator.isValid(fname))return res.status(400).send({ status: false, message: `fname is required` });
        if(!validFName.test(fname))return res.status(400).send({ status: false, message: `fname is in invalid Format` });

        //lname
        if (!validator.isValid(lname)) return res.status(400).send({ status: false, message: `lname is required ` });
        if(!validLName.test(lname))return res.status(400).send({ status: false, message: `lname is in invalid format ` });

        //email
        if (!validator.isValid(email)) return res.status(400).send({ status: false, message: `Email is required` })
        email = email.trim().toLowerCase()
        if (!(validEmail.test(email))) return res.status(400).send({ status: false, message: `Email should be a valid email address ` })
        const isEmailAlreadyUsed = await userModel.findOne({ email }); 
        if (isEmailAlreadyUsed) return res.status(400).send({ status: false, message: `${email} email address is already registered` })

        //profileImage
        if(!files || (files && files.length ===0))return res.status(400).send({status: false, message: 'Profile image is required'})
        const profileImage=await aws.uploadFile(files[0],"user")

        //phone
        if (!validator.isValid(phone)) return res.status(400).send({ status: false, message: 'phone no is required' });
        phone = phone.trim()
        if (!(validPhone.test(phone))) return res.status(400).send({ status: false, message: `Please fill a valid phone number` })
        const isPhoneAlreadyUsed = await userModel.findOne({ phone });
        if (isPhoneAlreadyUsed) return res.status(400).send({ status: false, message: `${phone} phone number is already registered` })

        //password
        if (!validator.isValid(password)) return res.status(400).send({ status: false, message: `Password is required` })
        password = password.trim()
        if (!(password.length > 7 && password.length < 16)) return res.status(400).send({ status: false, message: "password should  between 8 and 15 characters" })
       
        //address

        if(!validator.isValidBody(address))return res.status(400).send({ status: false, message: `Address is required` })
        if(!typeof address=="object")return res.status(400).send({ status: false, message: `Address is in Invalid Format` })
        
        // if (!address.shipping || (address.shipping && (!address.shipping.street || !address.shipping.city || !address.shipping.pincode))) return res.status(400).send({ status: false, message: 'Shipping address is required' })
        // if (!address.billing || (address.billing && (!address.billing.street || !address.billing.city || !address.billing.pincode))) return res.status(400).send({ status: false, message: 'Billing address is required' })
        
// ---------------------------------Validation ends-------------------------------
        const salt =await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        requestBody.password=hashedPassword
        requestBody.profileImage=profileImage
        
        const newUser = await userModel.create(requestBody);
        return res.status(201).send({ status: true, message: ` User created successfully`, data: newUser });
    }catch(error){
        return res.status(500).send({ status: false, message: error.message });
    }
}

const getUserById=async (req,res)=>{
    try{
        const userId=req.params.userId
        if(!ObjectId(userId)) return res.status(400).send({ status: false, message: `${userId} is not a valid userId` })
        const user=await userModel.findOne({_id:userId})
        if(!user)return res.status(404).send({status:false,message:"UserId Not found"})
        return res.status(200).send({ status: true, message: 'User profile details', data: user })
    }catch(error){
        return res.status(500).send({status:false,message:error.message})
    }
}


module.exports={createUser,getUserById}