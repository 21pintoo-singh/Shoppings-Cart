const express=require("express")
const router=express.Router()

const userController=require("../controllers/userController")
const productController=require("../controllers/productController")
const verify=require("../middleware/auth")

/*----------------------------USER API's-------------------------------------- */
router.post("/register",userController.createUser)
router.post('/login', userController.loginUser)
router.get("/user/:userId/profile",verify.authentication,userController.getUserById)
router.put("/user/:userId/profile",userController.updateUser)

/*------------------------------PRODUCT API's---------------------------------------*/
router.post("/products",productController.createProduct)

router.get('/products', productController.getProduct)

router.get("/products/:productId",productController.getProductById)

router.put("/products/:productId",productController.updateProduct)

router.delete("/products/:productId",productController.deleteById)





module.exports=router