const express=require("express")
const router=express.Router()

const userController=require("../controllers/userController")
const productController=require("../controllers/productController")
const authentication=require("../middleware/auth")
const cartController=require("../controllers/cartController")
const orderController=require("../controllers/orderController")

/*----------------------------USER API's-------------------------------------- */
router.post("/register",userController.createUser)
router.post('/login', userController.loginUser)
router.get("/user/:userId/profile",authentication,userController.getUserById)
router.put("/user/:userId/profile",authentication,userController.updateUser)

/*------------------------------PRODUCT API's---------------------------------------*/
router.post("/products",productController.createProduct)
router.get('/products', productController.getProduct)
router.get("/products/:productId",productController.getProductById)
router.put("/products/:productId",productController.updateProduct)
router.delete("/products/:productId",productController.deleteById)

//----------------------------CART API's-----------------------------------------------

router.post("/createCart/:userId",authentication,cartController.createCart)
router.put("/users/:userId/cart",authentication,cartController.updateCart)
router.get("/users/:userId/cart",authentication,cartController.getById)
router.delete("/users/:userId/cart",authentication,cartController.deleteById)

//------------------------------ORDER API's---------------------------------------------

router.post("/users/:userId/orders",authentication,orderController.createOrder)
router.put("/users/:userId/orders",authentication,orderController.updateOrder)

router.all("/*",(req,res)=>{
    return res.status(404).send({status:false,message:"Invalid URL"})
})

module.exports=router