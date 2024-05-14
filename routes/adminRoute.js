const express = require("express");
const adminController = require('../controller/adminController');
const { route } = require("./userRoute");



const router = express.Router()

router.get('/', adminController.login)

router.post('/', adminController.login)

router.get('/dashboard', adminController.dashboard)

router.get('/products', adminController.products)
router.get('/products/data', adminController.productData)

router.get('/addProduct', adminController.addProduct)

router.post('/addProduct', adminController.addProduct)

router.get('/users', adminController.users)
router.get('/users/data', adminController.usersData)
router.post('/users/data/status', adminController.userStatus)

router.get('/category', adminController.category)

router.get('/addCategory', adminController.addCategory)

router.post('/addCategory', adminController.addCategory)

module.exports = router;