const express=require("express")
const router=express.Router()

const userController=require("../controllers/userController")
const verify=require("../middleware/auth")

/*----------------------------USER API's-------------------------------------- */
router.post("/register",userController.createUser)

router.post('/login', userController.loginUser)

router.get("/user/:userId/profile",verify.authentication,userController.getUserById)

router.put("/user/:userId/profile",userController.updateUser)












module.exports=router