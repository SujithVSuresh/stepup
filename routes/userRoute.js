const express = require('express')
const auth = require("../middleware/userAuth");

const userController = require("../controller/userController")



const router = express.Router()

router.get('/', userController.home)

router.get('/shop', auth.isLogin, userController.shop)

router.get('/shop/items', auth.isLogin, userController.items)

router.get('/shop/:productId', auth.isLogin, userController.productDetail)

// router.get('/shop/product/details', userController.fetchProductDetails)

router.get('/signin',  auth.isLogout, userController.signin)

router.post('/signin',  auth.isLogout, userController.signin)

router.get('/logout', userController.logout)

router.get('/signup',  auth.isLogout, userController.signup)

router.post('/signup', auth.isLogout,  userController.signup)

router.get('/signup/otp', auth.isLogout,  userController.otp)

router.post('/signup/otp/email',  auth.isLogout, userController.otpMailSender)

router.post('/signup/otp/verify', userController.verifyOtp)



module.exports = router;