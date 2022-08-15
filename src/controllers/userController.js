const userModel = require('../models/userModel')
const vfy = require('../utility/validation')
const bcrypt = require('bcrypt');
const { uploadFile } = require('./../../aws.config')
const jwt = require('jsonwebtoken');
const saltRounds = 10;

//======================== #Post Api {Creat User} ==========================================>>

const createUser = async function (req, res) {
    try {
        const requestBody = req.body
        //console.log(vfy.isEmptyObject(requestBody))
        if (vfy.isEmptyObject(requestBody)) return res.status(400).send({ status: false, Message: "Invalid request parameters, Please provide user details" })

        let { fname, lname, email, phone, password, address } = requestBody

        const files = req.files

        if (vfy.isEmptyFile(files)) return res.status(400).send({ status: false, Message: "Please provide user's profile picture" })

        if (vfy.isEmptyVar(fname)) return res.status(400).send({ status: false, Message: "Please provide user's first name" })

        if (vfy.isEmptyVar(lname)) return res.status(400).send({ status: false, Message: "Please provide user's last name" })

        if (vfy.isEmptyVar(email)) return res.status(400).send({ status: false, Message: "Please provide user's email" })

        if (!vfy.isValidEmail(email)) return res.status(400).send({ status: false, Message: "please provide valid email" });

        if (vfy.isEmptyVar(phone)) return res.status(400).send({ status: false, Message: "Please provide phone number" })
        if (!vfy.isValidPhone(phone)) return res.status(400).send({ status: false, Message: "please provide valid phone number" });
        if (vfy.isEmptyVar(password)) return res.status(400).send({ status: false, Message: "Please provide password" })
        if (!vfy.isValidPassword(password)) return res.status(400).send({ status: false, Message: "Password must contain lenth between 8 - 15 with minimum 1 special character" })

        if (vfy.isEmptyVar(address)) return res.status(400).send({ status: false, Message: "Please provide address" })
        const addressObject = vfy.isValidJSONstr(address)
        if (!addressObject) return res.status(400).send({ status: false, Message: "Address json you are providing is not in a valid format " })

        let {
            shipping,
            billing
        } = addressObject

        // console.log(addressObject)

        // shipping address validation
        if (vfy.isEmptyObject(shipping)) return res.status(400).send({ status: false, Message: "Please provide shipping address" })
        if (vfy.isEmptyVar(shipping.street)) return res.status(400).send({ status: false, Message: "Plz provide shipping street..!!" });
        if (vfy.isEmptyVar(shipping.city)) return res.status(400).send({ status: false, Message: "Plz provide shipping city..!!" });
        if (!shipping.pincode || isNaN(shipping.pincode)) return res.status(400).send({ status: false, Message: "Plz provide shopping pincode" });
        if (!vfy.isPincodeValid(shipping.pincode)) return res.status(400).send({ status: false, Message: "Plz provide a valid pincode" });

        // billinf address validation
        if (vfy.isEmptyObject(billing)) return res.status(400).send({ status: false, Message: "Plz provide billing address.!!" });
        if (vfy.isEmptyVar(billing.street)) return res.status(400).send({ status: false, Message: "Plz provide billing street..!!" });
        if (vfy.isEmptyVar(billing.city)) return res.status(400).send({ status: false, Message: "Plz provide billing city..!!" });
        if (!billing.pincode || isNaN(billing.pincode)) return res.status(400).send({ status: false, Message: "Plz provide billing pincode" });
        if (!vfy.isPincodeValid(billing.pincode)) return res.status(400).send({ status: false, Message: "Plz provide a valid pincode" });

        //=================================Unique Db calls (Time saving)======================>>

        let usedEmail = await userModel.findOne({ email });
        if (usedEmail) return res.status(400).send({ status: false, Message: "This email is already registerd" });

        let usedMobileNumber = await userModel.findOne({ phone });
        if (usedMobileNumber) return res.status(400).send({ status: false, Message: "This Mobile no. is already registerd" });

        // ================================= qws file upload here 📷📷🖼️ ==========================>>
        if (!vfy.acceptFileType(files[0], 'image/jpeg', 'image/png')) return res.status(400).send({ status: false, Message: "we accept jpg, jpeg or png as profile picture only" });

        const profilePicture = await uploadFile(files[0])

        const encryptedPassword = await bcrypt.hash(password, saltRounds)
        const userrequestBody = { fname, lname, email, phone, profileImage: profilePicture, password: encryptedPassword, address: addressObject }

        // create user ✅
        const newUser = await userModel.create(userrequestBody);

        res.status(201).send({
            status: true,
            message: `User registered successfully`,
            data: newUser
        });


    } catch (error) {
        console.log(error)
        res.status(500).send({
            status: false,
            Message: error.message
        })
    }
}

//======================== #login Api 🔑 ===============================>>

const login = async (req, res) => {
    try {
        // 💁‍♂️ get data from body
        const data = req.body
        if (vfy.isEmptyObject(data)) return res.status(400).send({ status: !true, message: " Login BODY must be required!" })

        // de-structure data 
        let { email, password } = data;

        //Basic validations
        if (vfy.isEmptyVar(email)) return res.status(400).send({ status: !true, message: " Email address must be required!" })

        if (!vfy.isValidEmail(email)) return res.status(400).send({ status: !true, message: " Invalid Email address!" })

        if (vfy.isEmptyVar(password)) return res.status(400).send({ status: !true, message: " Password must be required!" })

        //  db call for login and validation
        const user = await userModel.findOne({ email })

        if (!user) return res.status(404).send({ status: !true, message: ` ${email} - related user does't exist!` })

        // 🔐 vfy the password
        const verify = await bcrypt.compare(password, user.password).catch(_ => {
            console.log(_.message)
            return !true
        })

        if (!verify) return res.status(401).send({ status: !true, message: `❌ Wrong Email address or Password!` })

        // 🔐 generate Token one hr
        const Token = jwt.sign({
            userId: user._id
        }, 'secret', {
            expiresIn: '1h'
        });



        // ✅ all good
        res.status(200).send({
            status: true,
            message: `User Logged-in Successfully!`,
            data: {
                userId: user._id,
                token: Token
            }
        })
    } catch (error) {
        // console.log(error)
        res.status(500).send({
            status: !true,
            Message: error.message
        })
    }
}


//==========================================#put Api (update User) ============================================>>

const update = async (req, res) => {
    try {
        //  get data from body
        const data = req.body
        const files = req.files
        const userId = req.params.userId

        if (vfy.isEmptyObject(data) && vfy.isEmptyFile(files)) return res.status(400).send({ status: !true, message: " BODY must be required!" })

        // 👉 get User by userID
        const user = await userModel.findById(userId).catch(_ => null)
        if (!user) return res.status(404).send({ status: !true, message: " User data not found!" })

        // 👉 de-structure data
        let { fname, lname, email, phone, password, address } = data


        if (!vfy.isEmptyVar(fname)) {
            user.fname = fname
        }

        if (!vfy.isEmptyVar(lname)) {
            user.lname = lname
        }

        if (!vfy.isEmptyVar(email)) {
            if (!vfy.isValidEmail(email)) return res.status(400).send({ status: !true, message: " Invalid email address!" })
            let usedEmail = await userModel.findOne({ _id: { $ne: userId }, email });
            if (usedEmail) return res.status(400).send({ status: false, Message: "This email is already registerd" });

            user.email = email
        }

        if (!vfy.isEmptyVar(phone)) {
            if (!vfy.isValidPhone(phone)) return res.status(400).send({ status: !true, message: " Invalid phone number!" })
            let usedMobileNumber = await userModel.findOne({ _id: { $ne: userId }, phone });
            if (usedMobileNumber) return res.status(400).send({ status: false, Message: "This Mobile no. is already registerd" });

            user.phone = phone
        }

        if (!vfy.isEmptyVar(password)) {
            if (!vfy.isValidPassword(password)) return res.status(400).send({ status: !true, message: " Please enter a valid password [A-Z] [a-z] [0-9] !@#$%^& and length with in 8-15" })
            const encryptedPassword = await bcrypt.hash(password, saltRounds)
            user.password = encryptedPassword
        }

        if (!vfy.isEmptyVar(address)) {
            let addressObj = vfy.isValidJSONstr(address)
            if (!addressObj) return res.status(400).send({ status: !true, message: " JSON address NOT in a valid structure, make it in a format!" })

            address = addressObj
            let {
                shipping,
                billing
            } = address

            // shipping address validation
            if (!vfy.isEmptyObject(shipping)) {
                if (!vfy.isEmptyVar(shipping.street)) {
                    user.address.shipping.street = shipping.street
                }

                if (!vfy.isEmptyVar(shipping.city)) {
                    user.address.shipping.city = shipping.city
                }

                if (!shipping.pincode || isNaN(shipping.pincode)) {
                    if (!vfy.isPincodeValid(shipping.pincode)) return res.status(400).send({ status: false, Message: "Plz provide a valid pincode for shipping" });
                    user.address.shipping.pincode = shipping.pincode
                }
            }

            // billing address validation
            if (!vfy.isEmptyObject(billing)) {
                if (!vfy.isEmptyVar(billing.street)) {
                    user.address.billing.street = billing.street
                }

                if (!vfy.isEmptyVar(billing.city)) {
                    user.address.billing.city = billing.city
                }

                if (!billing.pincode || isNaN(billing.pincode)) {
                    if (!vfy.isPincodeValid(billing.pincode)) return res.status(400).send({ status: false, Message: "Plz provide a valid pincode for billing" });
                    user.address.billing.pincode = billing.pincode
                }
            }

        }

        if (!vfy.isEmptyFile(files)) {
            if (!vfy.acceptFileType(files[0], 'image/jpeg', 'image/png')) return res.status(400).send({ status: false, Message: "we accept jpg, jpeg or png as profile picture only" });

            const profilePicture = await uploadFile(files[0])
            user.profileImage = profilePicture
        }

        await user.save()

        res.status(200).send({
            status: true,
            Message: "User Updated successfully!",
            data: user
        })

    } catch (error) {
        console.log(error)
        res.status(500).send({
            status: !true,
            Message: error.message
        })
    }
}
//==========================================#Get Api (Get User) ============================================>>

const getUser = async function (req, res) {
    try {
        let userId = req.params.userId
        let user = await userModel.findById(userId)
        if (!user) {
            return res.status(404).send({ status: false, Message: "No such user found" })
        }
        return res.status(200).send({ status: true, data: user })
    } catch (err) {
        return res.status(500).send({ status: false, Message: err.message })
    }
}

module.exports = { createUser, login, getUser, update }