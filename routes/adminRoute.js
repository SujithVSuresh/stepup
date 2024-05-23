const express = require("express");
const adminController = require('../controller/adminController');
const multer = require("multer");
const path = require("path");
const auth = require("../middleware/adminAuth")



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

  // Middleware to handle multiple file uploads
const uploadFields = upload.fields([
  { name: 'productImgOne', maxCount: 1 },
  { name: 'productImgTwo', maxCount: 1 },
  { name: 'productImgThree', maxCount: 1 },
  { name: 'productImgFour', maxCount: 1 },
]);

const router = express.Router()

router.get('/', auth.isAdminLogout, adminController.login)

router.post('/', auth.isAdminLogout, adminController.login)

router.get("/logout", auth.isAdminLogin, adminController.logout);

router.get('/dashboard', auth.isAdminLogin, adminController.dashboard)

router.get('/products', auth.isAdminLogin, adminController.products)
router.get('/products/data', auth.isAdminLogin, adminController.productData)

router.post('/addProduct', auth.isAdminLogin, adminController.addProduct)
router.post('/addProduct/colorVarient', auth.isAdminLogin, uploadFields, adminController.addColorVarient)

router.get('/users', auth.isAdminLogin, adminController.users)
router.get('/users/data', auth.isAdminLogin, adminController.usersData)
router.post('/users/data/status', auth.isAdminLogin, adminController.userStatus)

router.get('/category', auth.isAdminLogin, adminController.category)
router.get('/category/list', auth.isAdminLogin, adminController.categoryList)
router.get('/category/unlisted', auth.isAdminLogin, adminController.unlistedCategory)
router.post('/category/add', auth.isAdminLogin, upload.single("croppedImage"), adminController.addCategory)
router.post('/category/edit', auth.isAdminLogin, adminController.editCategory)
router.post('/category/manage', auth.isAdminLogin, adminController.manageCategoryStatus)


router.get('/brands', auth.isAdminLogin, adminController.brands)
router.get('/brands/list', auth.isAdminLogin, adminController.brandList)
router.post('/brand/add', auth.isAdminLogin, upload.single("croppedImage"), adminController.addBrand)


module.exports = router;