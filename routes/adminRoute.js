const express = require("express");
const adminController = require('../controller/adminController');
const multer = require("multer");
const path = require("path");



const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      // Define the destination where uploaded files will be stored
      cb(null, path.join(__dirname, "../public/images"));
    },
    filename: function (req, file, cb) {
      // Define the filename for uploaded files
      cb(null, Date.now() + "-" + file.originalname);
    },
  });

  const upload = multer({ storage: storage });

const router = express.Router()

router.get('/', adminController.login)

router.post('/', adminController.login)

router.get('/dashboard', adminController.dashboard)

router.get('/products', adminController.products)
router.get('/products/data', adminController.productData)

router.get('/addProduct', adminController.addProduct)

router.post('/addProduct', upload.array('images[]'), adminController.addProduct)

router.get('/users', adminController.users)
router.get('/users/data', adminController.usersData)
router.post('/users/data/status', adminController.userStatus)

router.get('/category', adminController.category)
router.post('/addCategory', adminController.addCategory)

module.exports = router;