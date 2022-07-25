const userModel=require("../models/userModels")
const bcrypt=require("bcrypt")
const validator=require("../utility/validation")
const aws=require("../utility/aws.config")

const createUser=async (req,res)=>{
    try{
        let files = req.files;
        const requestBody=req.body
        console.log(requestBody)
        if(!validator.isValidRequestBody(requestBody))return res.status(400).send({ status: false, message: 'Please provide user details' })

        const { fname, lname, phone, email, password, address } = requestBody// Object destructing
        console.log(fname)
        console.log(requestBody)
        
//----------------------------------Validation starts--------------------------------
        //fname
        if(!validator.isValid(fname))return res.status(400).send({ status: false, message: `fname is required` });
        if(!validator.validFName.test(fname))return res.status(400).send({ status: false, message: `fname is in invalid Format` });

        //lname
        if (!validator.isValid(lname)) return res.status(400).send({ status: false, message: `lname is required ` });
        if(!validator.validLName.test(lname))return res.status(400).send({ status: false, message: `lname is in invalid format ` });

        //email
        if (!validator.isValid(email)) return res.status(400).send({ status: false, message: `Email is required` })
        email = email.trim().toLowerCase()
        if (!(validator.validEmail.test(email))) return res.status(400).send({ status: false, message: `Email should be a valid email address ` })
        const isEmailAlreadyUsed = await userModel.findOne({ email }); 
        if (isEmailAlreadyUsed) return res.status(400).send({ status: false, message: `${email} email address is already registered` })

        //profileImage
        if(!files || (files && files.length ===0))return res.status(400).send({status: false, message: 'Profile image is required'})
        const profileImage=await aws.uploadFile(files[0],"user")

        //phone
        if (!validator.isValid(phone)) return res.status(400).send({ status: false, message: 'phone no is required' });
        phone = phone.trim()
        if (!(validator.validNumber.test(phone))) return res.status(400).send({ status: false, message: `Please fill a valid phone number` })
        const isPhoneAlreadyUsed = await userModel.findOne({ phone });
        if (isPhoneAlreadyUsed) return res.status(400).send({ status: false, message: `${phone} phone number is already registered` })

        //password
        if (!validator.isValid(password)) return res.status(400).send({ status: false, message: `Password is required` })
        password = password.trim()
        if (!(password.length > 7 && password.length < 16)) return res.status(400).send({ status: false, message: "password should  between 8 and 15 characters" })
       

        //address
        if(!validator.isValidRequestBody(address))return res.status(400).send({ status: false, message: `Address is required` })
        if(!typeof address=="object")return res.status(400).send({ status: false, message: `Address is in Invalid Format` })
        address=JSON.parse(address)
        if (!address.shipping || (address.shipping && (!address.shipping.street || !address.shipping.city || !address.shipping.pincode))) return res.status(400).send({ status: false, message: 'Shipping address is required' })
        if (!address.billing || (address.billing && (!address.billing.street || !address.billing.city || !address.billing.pincode))) return res.status(400).send({ status: false, message: 'Billing address is required' })
        
// ---------------------------------Validation ends-------------------------------
        const salt =await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        const userData = { fname, lname, phone, email,profileImage: profileImage,  password:hashedPassword, address };

        const newUser = await userModel.create(userData);
        return res.status(201).send({ status: true, message: ` User created successfully`, data: newUser });
    }catch(error){
        return res.status(500).send({ status: false, message: error.message });
    }
}

const getUserById=async (req,res)=>{
    try{
        const userId=req.params.userId
        if(!validator.isValidObjectId(userId)) return res.status(400).send({ status: false, message: `${userId} is not a valid userId` })
        const user=await findOne({_id:userId})
        if(!user)return res.status(404).send({status:false,message:"UserId Not found"})
        return res.status(200).send({ status: true, message: 'User profile details', data: user })
    }catch(error){
        return res.status(500).send({status:false,message:error.message})
    }
}


module.exports={createUser,getUserById}