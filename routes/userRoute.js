const express = require('express')

const userController = require("../controller/userController")



const router = express.Router()

router.get('/', userController.home)

router.get('/shop', userController.shop)

router.get('/shop/items', userController.items)

router.get('/shop/:productId', userController.productDetail)

router.get('/shop/product/details', userController.fetchProductDetails)

router.get('/signin', userController.signin)

router.post('/signin', userController.signin)

router.get('/signup', userController.signup)

router.post('/signup', userController.signup)

router.get('/signup/otp', userController.otp)

router.post('/signup/otp/email', userController.otpMailSender)

router.post('/signup/otp/verify', userController.verifyOtp)



module.exports = router;