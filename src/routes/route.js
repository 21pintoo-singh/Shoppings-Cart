const express=require("express")
const router=express.Router()

const userController=require("../controllers/userController")
const productController=require("../controllers/productController")
const verify=require("../middleware/auth")
const cartController=require("../controllers/cartController")
const orderController=require("../controllers/orderController")

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

//----------------------------CART API's-----------------------------------------------

router.post("/createCart/:userId",cartController.createCart)
router.put("/users/:userId/cart",cartController.updateCart)
router.get("/users/:userId/cart",cartController.getById)
router.delete("/users/:userId/cart",cartController.deleteById)

//------------------------------ORDER API's---------------------------------------------

router.post("/users/:userId/orders",orderController.createOrder)
router.put("/users/:userId/orders",orderController.updateOrder)

router.all("/*",(req,res)=>{
    return res.status(404).send({status:false,message:"Api not found"})
})

module.exports=router