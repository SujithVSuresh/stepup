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
router.get('/unlistedProducts', auth.isAdminLogin, adminController.unlistedProducts)
router.get('/products/data', auth.isAdminLogin, adminController.productData)
router.get('/unlistedProducts/data', auth.isAdminLogin, adminController.unlistedProductData)


router.post('/addProduct', auth.isAdminLogin, adminController.addProduct)
router.post('/editProduct', auth.isAdminLogin, adminController.editProduct)
router.post('/manageDeleteProduct', auth.isAdminLogin, adminController.manageProductDeleteStatus)

router.post('/addProduct/colorVarient', auth.isAdminLogin, uploadFields, adminController.addColorVarient)
router.post('/delete/colorVarient', auth.isAdminLogin, adminController.deleteColorVarient)

router.post('/addProduct/sizeVarient', auth.isAdminLogin, adminController.addSizeVarient)
router.post('/editProduct/sizeVarient', auth.isAdminLogin, adminController.editSizeVarient)
router.post('/deleteProduct/sizeVarient', auth.isAdminLogin, adminController.deleteSizeVarient)

router.get('/product/getColorVarient', auth.isAdminLogin, adminController.getAllColorVarient)
router.get('/product/getSizeVarient', auth.isAdminLogin, adminController.getAllSizeVarient)
router.get('/product/singleProductData', auth.isAdminLogin, adminController.singleProductData)

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


router.get('/order', auth.isAdminLogin, adminController.order)
router.get('/order/items', auth.isAdminLogin, adminController.orderItem)
router.post('/order/items/changeStatus', auth.isAdminLogin, adminController.changeOrderStatus)

router.get('/coupon', auth.isAdminLogin, adminController.coupon)
router.post('/coupon/addCoupon', auth.isAdminLogin, adminController.addCoupon)
router.post('/coupon/deleteCoupon', auth.isAdminLogin, adminController.deleteCoupon)

router.get('/salesReport', auth.isAdminLogin, adminController.salesReport)
router.get('/salesReport/data', auth.isAdminLogin, adminController.salesReportData)



module.exports = router;