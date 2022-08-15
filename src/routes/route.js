const express = require('express');
let router = express.Router();
const controller = require('../controllers/userController')
const product = require('../controllers/productController')
const cart = require('../controllers/cartController')
const order = require('../controllers/orderController')
const { authentication, authorization_user } = require('../middleware/auth')

// -----------------------user APIs
router.post('/register', controller.createUser)
router.post('/login', controller.login)
router.put('/user/:userId/profile', authentication, authorization_user, controller.update)
router.get('/user/:userId/profile', authentication, authorization_user, controller.getUser)

// ---------------------------products APIs
router.post('/products', product.create)
router.get('/products', product.getProduct)
router.get('/products/:productId', product.getProductById)
router.put('/products/:productId', product.updateProductById)
router.delete('/products/:productId', product.deleteProduct)

// ---------------------------------cart APIs
router.post('/users/:userId/cart', authentication, authorization_user, cart.create)
router.put('/users/:userId/cart', authentication, authorization_user, cart.update)
router.get('/users/:userId/cart', authentication, authorization_user, cart.getCart)
router.delete('/users/:userId/cart', authentication, authorization_user, cart.deleteCart)

// ---------------------------------------Order Apis
router.post('/users/:userId/orders', authentication, authorization_user, order.createOrder)
router.put('/users/:userId/orders', authentication, authorization_user, order.updateOrder)

module.exports = router;