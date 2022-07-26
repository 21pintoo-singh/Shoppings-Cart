const userModel=require("../models/userModels")
const bcrypt=require("bcrypt")
const validator=require("../utility/validation")
const aws=require("../utility/awsconfig")

const mongoose=require("mongoose")
const ObjectId=mongoose.Types.ObjectId


const emailRex=/^[a-zA-Z0-9]+[@][a-z]{3,6}[.][a-z]{2,5}$/
const phoneRex=/^[6789][0-9]{9}$/



const createUser=async (req,res)=>{
    try{
        let files = req.files;
        const requestBody=req.body
        // console.log(requestBody)
        if(!validator.isValidBody(requestBody))return res.status(400).send({ status: false, message: 'Please provide user details' })

        let { fname, lname, phone, email, password, address } = requestBody// Object destructing
//----------------------------------Validation starts--------------------------------
        //fname
        if(!validator.isValid(fname))return res.status(400).send({ status: false, message: `fname is required` });
        if(!fname.trim().match(/^[a-zA-Z]{2,20}$/))return res.status(400).send({ status: false, message: `Firstname should only contain alphabet` });

        //lname
        if (!validator.isValid(lname)) return res.status(400).send({ status: false, message: `lname is required ` });
        if(!lname.trim().match(/^[a-zA-Z]{2,20}$/))return res.status(400).send({ status: false, message: `lname should only contain alphabet ` });

        //email
        if (!validator.isValid(email)) return res.status(400).send({ status: false, message: `Email is required` })
        email = email.trim().toLowerCase()
        if (!email.trim().match(emailRex)) return res.status(400).send({ status: false, message: `Email should be a valid email address ` })
        const isEmailAlreadyUsed = await userModel.findOne({ email }); 
        if (isEmailAlreadyUsed) return res.status(400).send({ status: false, message: `${email} email address is already registered` })

        //profileImage
        if(!files || (files && files.length ===0))return res.status(400).send({status: false, message: 'Profile image is required'})
        const profilePicture=await aws.uploadFile(files[0],"user")

        //phone
        if (!validator.isValid(phone)) return res.status(400).send({ status: false, message: 'phone no is required' });
        phone = phone.trim()
        if (!phone.trim().match(phoneRex)) return res.status(400).send({ status: false, message: `Please fill a valid phone number` })
        const isPhoneAlreadyUsed = await userModel.findOne({ phone });
        if (isPhoneAlreadyUsed) return res.status(400).send({ status: false, message: `${phone} phone number is already registered` })

        //password
        if (!validator.isValid(password)) return res.status(400).send({ status: false, message: `Password is required` })
        if (!(password.trim().length > 7 && password.length < 16)) return res.status(400).send({ status: false, message: "password should  between 8 and 15 characters" })
       
        //address
        if (!validator.isValid(address))
        return res.status(400).json({ status: false, msg: "address is required" });

        if(typeof(address)=="object")return res.status(400).send({ status: false, message: `Address must be in object` })
      
        
// ---------------------------------Validation ends-------------------------------
        const salt =await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        // console.log(hashedPassword)
        const userData = {
            fname: fname,
            lname: lname,
            profileImage: profilePicture,
            email: email,
            phone,
            password: hashedPassword,
            address: address,
          }
        
        const newUser = await userModel.create(userData);
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