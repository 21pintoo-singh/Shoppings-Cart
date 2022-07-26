const express=require("express")
const router=express.Router()

const userController=require("../controllers/userController")


router.post("/register",userController.createUser)

router.get("/user/:userId/profile",userController.getUserById)

router.post('/login', userController.loginUser)

// router.put("/user/:userId/profile",userController.updateUserProfile)












module.exports=router