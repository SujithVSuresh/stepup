const Category = require("../models/categoryModel");
const Admin = require("../models/adminModel");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const Brand = require("../models/brandModal");
const Varient = require("../models/varientModel");
const Subvarient = require("../models/subVarientModel");
const Order = require("../models/orderModel");
const Wallet = require("../models/walletModel");
const Coupon = require("../models/couponModel");
const bcrypt = require("bcrypt");

const login = async (req, res) => {
  try {
    if (req.method == "GET") {
      res.render("admin/login", { isLogin: false });
    }

    if (req.method == "POST") {
      const { email, password } = req.body;

      const admin = await Admin.findOne({ email: email });
      //console.log(admin.password);

      if (admin && (await bcrypt.compare(password, admin.password))) {
        req.session.adminId = admin._id;
        req.session.adminName = admin.firstName + " " + admin.lastName;
        res.status(200).json({ message: "login successfull" });
      } else {
        res
          .status(404)
          .json({ message: "No user found with these email and password" });
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const logout = (req, res) => {
  try {
    if (req.session.adminId) {
      delete req.session.adminId;
      delete req.session.adminName;
    }

    res.redirect("/admin");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const dashboard = async (req, res) => {
  try {
    res.render("admin/dashboard", {
      isLogin: true,
      adminName: req.session.adminName,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const products = async (req, res) => {
  try {
    res.render("admin/product", {
      isLogin: true,
      adminName: req.session.adminName,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const productData = async (req, res) => {
  try {
    if (req.method === "GET") {
      const products = await Product.find({ isDelete: false }).populate([
        { path: "category" },
        { path: "brand" },
      ]);

      console.log(products);

      res.status(200).json({ products: products });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const unlistedProducts = async (req, res) => {
  try {
    res.render("admin/unlistedProduct", {
      isLogin: true,
      adminName: req.session.adminName,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const unlistedProductData = async (req, res) => {
  try {
    if (req.method === "GET") {
      const products = await Product.find({ isDelete: true }).populate([
        { path: "category" },
        { path: "brand" },
      ]);

      res.status(200).json({ products: products });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addProduct = async (req, res) => {
  try {
    if (req.method == "POST") {
      const {
        model,
        brand,
        gender,
        category,
        outerMaterial,
        soleMaterial,
        description,
      } = req.body;

      console.log(
        model,
        brand,
        gender,
        category,
        outerMaterial,
        soleMaterial,
        description
      );

      // const imagePaths = req.files.map((file) => file.filename);

      const newProduct = new Product({
        modelName: model,
        brand: brand,
        gender: gender,
        category: category,
        outerMaterial: outerMaterial,
        soleMaterial: soleMaterial,
        description: description,
      });

      await newProduct.save();

      return res.status(200).json({ msg: "Product created successfully" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const editProduct = async (req, res) => {
  try {
    if (req.method === "POST") {
      const {
        model,
        brand,
        gender,
        category,
        outerMaterial,
        soleMaterial,
        description,
        id,
      } = req.body;

      let product = await Product.findOne({ _id: id });

      // let checkingCategory = await Category.findOne({
      //   categoryName: categoryName,
      //   _id: { $ne: id },
      // });

      // if (!checkingCategory) {
      //   category.categoryName = categoryName;
      //   await category.save();
      //   res.status(200).json({ categoryData: category });
      // } else {
      //   res.status(409).json({ message: "Category already exists" });
      // }

      console.log("Hello...............", product);

      product.modelName = model;
      product.brand = brand;
      product.gender = gender;
      product.category = category;
      product.outerMaterial = outerMaterial;
      product.soleMaterial = soleMaterial;
      product.description = description;

      product.save();

      // res.redirect('/admin/products')

      return res.status(200).json({ message: "product edited successfully." });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const manageProductDeleteStatus = async (req, res) => {
  try {
    if (req.method === "POST") {
      const { id } = req.body;

      let product = await Product.findOne({ _id: id });

      product.isDelete = !product.isDelete;

      await product.save();

      res.status(200).json({ deleteStatus: product.isDelete });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Users
const users = async (req, res) => {
  try {
    res.render("admin/user", {
      isLogin: true,
      adminName: req.session.adminName,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const usersData = async (req, res) => {
  try {
    if (req.method === "GET") {
      const users = await User.find({});

      res.status(200).json({ users: users });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const userStatus = async (req, res) => {
  try {
    if (req.method === "POST") {
      const { userId } = req.body;

      const user = await User.findOne({ _id: userId });

      if (user.isBlocked === true) {
        user.isBlocked = false;
        await user.save();
      } else {
        user.isBlocked = true;
        await user.save();
      }

      res.status(200).json(user);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//BRAND
const brands = async (req, res) => {
  try {
    //let categories = await Category.find({isDelete: false});

    //console.log(category);
    res.render("admin/brand", {
      isLogin: true,
      adminName: req.session.adminName,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addBrand = async (req, res) => {
  try {
    if (req.method === "POST") {
      try {
        const { brandValue } = req.body;

        console.log("lll", req.file.filename, brandValue);

        let brand = await Brand.findOne({ name: brandValue });
        // console.log(category, "lllll")

        if (!brand) {
          const newBrand = new Brand({
            name: brandValue,
            image: req.file.filename,
          });
          await newBrand.save();
          res.status(200).json({ brandData: newBrand });
        } else {
          res
            .status(409)
            .json({ message: "Brand with this name already exist." });
        }
      } catch (error) {
        console.error("Error in addColorVarient:", error);
        res.status(500).json({ error: error.message });
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const brandList = async (req, res) => {
  try {
    let brands = await Brand.find({});

    res.status(200).json({ brands: brands });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const category = async (req, res) => {
  try {
    let categories = await Category.find({ isDelete: false });

    console.log(category);
    res.render("admin/category", {
      categories: categories,
      isLogin: true,
      adminName: req.session.adminName,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const categoryList = async (req, res) => {
  try {
    let categories = await Category.find({ isDelete: false });

    res.status(200).json({ categories: categories });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const unlistedCategory = async (req, res) => {
  try {
    let categories = await Category.find({ isDelete: true });

    res.render("admin/unlistedCategory", {
      categories: categories,
      isLogin: true,
      adminName: req.session.adminName,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addCategory = async (req, res) => {
  try {
    if (req.method === "POST") {
      const { categoryValue } = req.body;

      const trimmedValue = categoryValue.trim().toLowerCase();

      // Case insensitive querying
      let category = await Category.findOne({
        categoryName: { $regex: new RegExp(`^${trimmedValue}$`, "i") },
        isDelete: false,
      });

      if (!category) {
        const newCategory = new Category({
          categoryName: categoryValue,
        });
        await newCategory.save();
        res.status(200).json({ categoryData: newCategory });
      } else {
        res.status(409).json({ message: "Category already exists" });
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const editCategory = async (req, res) => {
  try {
    if (req.method === "POST") {
      const { categoryName, id } = req.body;

      // let category = await Category.findOne({ _id: id });

      const trimmedValue = categoryName.trim().toLowerCase();

      let checkingCategory = await Category.findOne({
        categoryName: { $regex: new RegExp(`^${trimmedValue}$`, "i") },
        isDelete: false,
        _id: { $ne: id },
      });

      if (!checkingCategory) {
        const updatingCategory = await Category.updateOne(
          { _id: id },
          { $set: { categoryName: categoryName } }
        );

        const category = await Category.findById(id);

        return res.status(200).json({ categoryData: category });
      } else {
        return res.status(409).json({ message: "Category already exists" });
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const manageCategoryStatus = async (req, res) => {
  try {
    if (req.method === "POST") {
      const { id } = req.body;

      let category = await Category.findOne({ _id: id });

      if (category.isDelete == true) {
        const trimmedValue = category.categoryName.trim().toLowerCase();

        // Case insensitive querying
        let check = await Category.findOne({
          isDelete: false,
          categoryName: { $regex: new RegExp(`^${trimmedValue}$`, "i") },
        });

        if (check) {
          return res
            .status(409)
            .json({
              message:
                "Cannot list this category because the category with this same name already exist.",
            });
        }
      }

      category.isDelete = !category.isDelete;

      await category.save();

      return res.status(200).json({ deleteStatus: category.isDelete });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addColorVarient = async (req, res) => {
  try {
    const { colorName, colorCode, productId } = req.body;

    let findColorVarient = await Varient.findOne({
      product: productId,
      colorName: colorName,
      colorCode: colorCode,
    });

    if (findColorVarient) {
      return res
        .status(409)
        .json({ message: "Color you are trying to add already exists." });
    }

    const files = req.files;

    const productImage = await Object.values(files).map(
      (item) => item[0].filename
    );

    const colorVarient = new Varient({
      colorName: colorName,
      colorCode: colorCode,
      images: productImage,
      product: productId,
    });

    await colorVarient.save();

    if (colorVarient) {
      return res.status(200).json({ message: "Color added successfully" });
    }
  } catch (error) {
    console.error("Error in addColorVarient:", error);
    res.status(500).json({ error: error.message });
  }
};

const deleteColorVarient = async (req, res) => {
  try {
    const { varientId } = req.body;

    console.log(varientId, "colorVarientId");

    const colorVariant = await Varient.findOne({ _id: varientId });

    if (!colorVariant) {
      return res.status(409).json({ message: "No color varient found" });
    }

    await Varient.findByIdAndDelete(colorVariant._id);

    return res
      .status(200)
      .json({ message: "Color variant deleted successfully." });
  } catch (error) {
    console.error("Error in addColorVarient:", error);
    res.status(500).json({ error: error.message });
  }
};

const addSizeVarient = async (req, res) => {
  try {
    const { price, size, quantity, productId, varientId } = req.body;

    let checkingSubVarient = await Subvarient.findOne({
      size: size,
      varient: varientId,
    });

    console.log(checkingSubVarient, "preeeee");

    if (checkingSubVarient) {
      return res
        .status(409)
        .json({ message: "Size with this value already exists." });
    }

    const subVarient = new Subvarient({
      size: size,
      quantity: quantity,
      price: price,
      varient: varientId,
      product: productId,
    });

    await subVarient.save();

    return res.status(200).json({ subVarient: subVarient });
  } catch (error) {
    console.error("Error in addColorVarient:", error);
    res.status(500).json({ error: error.message });
  }
};

const editSizeVarient = async (req, res) => {
  try {
    const { price, size, quantity, id, varientId } = req.body;

    let checkingSubVarient = await Subvarient.findOne({
      size: size,
      varient: varientId,
      _id: { $ne: id },
    });

    if (!checkingSubVarient) {
      let subVarient = await Subvarient.findOne({ _id: id });

      subVarient.price = price;
      subVarient.size = size;
      subVarient.quantity = quantity;

      await subVarient.save();

      return res.status(200).json({ subVarient: subVarient });
    } else {
      return res
        .status(409)
        .json({ message: "Size with this value already exists." });
    }
  } catch (error) {
    console.error("Error in addColorVarient:", error);
    res.status(500).json({ error: error.message });
  }
};

const deleteSizeVarient = async (req, res) => {
  try {
    const { id } = req.body;

    const subVarient = await Subvarient.findByIdAndDelete(id);
    if (subVarient) {
      return res
        .status(200)
        .json({ message: "Size deleted successfully", subVarient: subVarient });
    } else {
      return res.status(404).json({ error: "Size not found" });
    }
  } catch (error) {
    console.error("Error in addColorVarient:", error);
    return res.status(500).json({ error: error.message });
  }
};

const getAllColorVarient = async (req, res) => {
  try {
    const productId = req.query.pid;

    const varients = await Varient.find({ product: productId });

    res.status(200).json({ colorVarients: varients });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllSizeVarient = async (req, res) => {
  try {
    const varientId = req.query.varientid;

    console.log(varientId, "Hi, how are you");

    const subVarients = await Subvarient.find({ varient: varientId });

    console.log(subVarients, "Hi, how are you222");

    res.status(200).json({ sizeVarients: subVarients });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const singleProductData = async (req, res) => {
  try {
    const productId = req.query.pid;

    const productData = await Product.findOne({ _id: productId }).populate([
      { path: "category" },
      { path: "brand" },
    ]);

    res.status(200).json({ productData: productData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const order = async (req, res) => {
  try {
    let orders = await Order.find({}).populate("userId").sort({"orderedDate": -1});
    
    res.render("admin/order", {
      orders: orders,
      isLogin: true,
      adminName: req.session.adminName,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const orderItem = async (req, res) => {
  try {
    const orderId = req.query.oid;

    const order = await Order.findOne({ _id: orderId }).populate("userId");

    res.render("admin/orderitem", {
      order: order,
      isLogin: true,
      adminName: req.session.adminName,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const changeOrderStatus = async (req, res) => {
  try {
    const { status, orderId, itemId } = req.body;

    const order = await Order.findOne({ _id: orderId }).populate("userId");

    const orderItem = order.orderedItems.find(
      (item) => item._id.toString() === itemId
    );

    if (status) {
      orderItem.orderStatus =
        status == "Approve"
          ? "RETURN_APPROVED"
          : status == "Reject"
          ? "Delivered"
          : status;
      if (status == "Approve") {
        orderItem.requestAcceptedDate = new Date();
      } else if (status == "Reject") {
        orderItem.requestRejectedDate = new Date();
      } else if (status == "Returned") {
        orderItem.returnedDate = new Date();
      } else if (status == "Shipped") {
        orderItem.shippedDate = new Date();
      } else if (status == "Delivered") {
        orderItem.deliveredDate = new Date();
      } else if (status == "Cancelled") {
        orderItem.cancelledDate = new Date();
      }

      await order.save();

      if (status == "Cancelled" || status == "Returned") {
        // To update quantity

        let subVartient = await Subvarient.findOne({
          _id: orderItem.productId,
        });
        if (subVartient) {
          subVartient.quantity += orderItem.quantity;
          await subVartient.save();
        }

        if (status == "Returned") {
          if (order.paymentMethod == "COD") {
            orderItem.paymentStatus = "Refunded";
            await order.save();
          } else if (order.paymentMethod == "ONLINE_PAYMENT") {
            let wallet = await Wallet.findOne({ userId: order.userId });

            if (!wallet) {
              wallet = new Wallet({
                userId: order.userId,
                balance: 0,
                history: [],
              });
            }

            wallet.history.push({
              date: new Date(),
              type: "credit",
              amount: orderItem.price,
              description: "Refund for order item return.",
            });
            wallet.balance += orderItem.price;

            await wallet.save();
          }
        }
      } else if (status == "Delivered") {
        if (order.paymentMethod == "COD") {
          orderItem.paymentStatus = "Success";
          await order.save();
        }
      }

      let count = 0;
      let paymentCount = 0;
      order.orderedItems.map((item) => {
        if (
          item.orderStatus == "Cancelled" ||
          item.orderStatus == "Delivered" ||
          item.orderStatus == "Returned"
        ) {
          count++;
        }

        // Handling payment status
        if (item.paymentStatus == "Success") {
          paymentCount++;
        }
      });

      if (count == order.orderedItems.length) {
        order.orderStatus = "Completed";
        await order.save();
      }

      if (paymentCount == order.orderedItems.length) {
        order.paymentStatus = "Success";
        await order.save();
      }
    }

    // let count = 0
    //   order.orderedItems.map((item) => {
    //     if(item.orderStatus == "Cancelled"){
    //       count++
    //     }

    //   })

    //   if(count==order.orderedItems.length){
    //     order.orderStatus = "Cancelled";
    //     await order.save();

    //   }

    res.status(200).json({ message: "Order status changed successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const coupon = async (req, res) => {
  try {
    if (req.method == "GET") {
      // const coupons = await Coupon.find({})
      const coupons = await Coupon.find({});
      console.log(coupons);

      res.render("admin/coupon", {
        coupons: coupons,
        isLogin: true,
        adminName: req.session.adminName,
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addCoupon = async (req, res) => {
  try {
    if (req.method == "POST") {
      const {
        couponCode,
        discountPercentage,
        maxOfferLimit,
        minOrderAmount,
        expiryDate,
      } = req.body.data;

      // let realCouponCode = couponCode.toUpperCase()

      const existingCoupon = await Coupon.findOne({
        couponCode: couponCode.toUpperCase(),
      });

      if (existingCoupon) {
        return res
          .status(400)
          .json({ error: "Coupon with this code already exists" });
      }

      const coupon = new Coupon({
        couponCode: couponCode.toUpperCase(),
        discountPercentage: discountPercentage,
        maxOfferLimit: maxOfferLimit,
        minOrderAmount: minOrderAmount,
        expiryDate: expiryDate,
      });

      await coupon.save();

      res.status(200).json({ coupon: coupon });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteCoupon = async (req, res) => {
  try {
    if (req.method == "POST") {
      const { couponId } = req.body.data;

      const deleteCoupon = await Coupon.findByIdAndDelete(couponId);

      if (!deleteCoupon) {
        return res.status(404).json({ message: "Coupon not found" });
      }

      return res
        .status(200)
        .json({ message: "Coupon deleted successfully", coupon: deleteCoupon });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const salesReport = async (req, res) => {
  try {
    res.render("admin/salesReport", {
      isLogin: true,
      adminName: req.session.adminName,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const salesReportData = async (req, res) => {
  try {
    const filterType = req.query.filter;
    let gte = null;
    let lte = null;

    if (filterType == "date") {
      gte = req.query.gte;
      lte = req.query.lte;
    }

    if (filterType == "day") {
      const currentDate = new Date();

      gte = new Date(currentDate);
      gte.setHours(0, 0, 0, 0);  

      lte = new Date(currentDate);
      lte.setHours(23, 59, 59, 999); 
    }

    if (filterType == "week") {
      const currentDate = new Date();

     
      const startOfWeek = new Date(currentDate);
      const dayOfWeek = currentDate.getDay();
      startOfWeek.setDate(currentDate.getDate() - dayOfWeek);
      startOfWeek.setHours(0, 0, 0, 0); 

      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999); 

      gte = startOfWeek;
      lte = endOfWeek;

      console.log("Start of the Week: ", gte);
      console.log("End of the Week: ", lte);
    }

    if (filterType == "month") {
      const currentDate = new Date();

      const startOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      startOfMonth.setHours(0, 0, 0, 0); 

      const endOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      );
      endOfMonth.setHours(23, 59, 59, 999); 

      gte = startOfMonth;
      lte = endOfMonth;
    }

    if (filterType == "year") {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();

      gte = new Date(currentYear, 0, 1);
      gte.setHours(0, 0, 0, 0); 

      lte = new Date(currentYear, 11, 31); 
      lte.setHours(23, 59, 59, 999); 
    }

    // Pipeline 1
    const pipeline = [
      { $unwind: "$orderedItems" },
      { $match: { "orderedItems.orderStatus": "Delivered" } },
    ];
    if (gte && lte) {
      pipeline.push({
        $match: {
          "orderedItems.deliveredDate": {
            $gte: new Date(gte),
            $lte: new Date(lte),
          },
        },
      });
    }
    pipeline.push({
      $group: {
        _id: "$_id",
        orderId: { $first: "$orderId" },
        paymentMethod: { $first: "$paymentMethod" },
        items: { $push: "$orderedItems" },
      },
    });
    // pipeline.push({
    //   $sort: {
    //     orderedDate: -1
    //   },
    // });
    const orders = await Order.aggregate(pipeline);

    // Pipeline 2
    const pipeline2 = [
      { $unwind: "$orderedItems" }, 
      { $match: { "orderedItems.orderStatus": "Delivered" } },
    ];

    pipeline2.push({
      $match: {},
    });

    if (gte && lte) {
      pipeline2.push({
        $match: {
          "orderedItems.deliveredDate": {
            $gte: new Date(gte),
            $lte: new Date(lte),
          },
        },
      });
    }
    pipeline2.push({
      $group: {
        _id: null,
        count: { $sum: 1 }, 
      },
    });
    const soldProductsCount = await Order.aggregate(pipeline2);

    // const orderedProductsCount = await Order.aggregate([
    //   { $unwind: "$orderedItems" }, // Deconstructs the orderedItems array
    //   { $match: {} }, // Filters delivered items
    //   {
    //     $match: {
    //       orderedDate: {
    //         $gte: gte,
    //         $lte: lte,
    //       },
    //     },
    //   },
    //   { $group: { _id: null, count: { $sum: 1 } } }, // Counts the filtered items
    // ]);


    const pipeline3 = [
      { $unwind: "$orderedItems" }, // Deconstructs the orderedItems array
      { $match: {} }, // Initial match stage, you can add more filters here if needed
    ];

    pipeline3.push({
      $match: {},
    });

    if (gte && lte) {
      pipeline3.push({
        $match: {
          orderedDate: {
            $gte: new Date(gte),
            $lte: new Date(lte),
          },
        },
      });
    }

    pipeline3.push({
      $group: {
        _id: null,
        count: { $sum: 1 }, 
      },
    });

    const orderedProductsCount = await Order.aggregate(pipeline3);


    return res.status(200).json({
      orders: orders,
      totalOrders: orderedProductsCount,
      totalSales: soldProductsCount,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  dashboard,
  products,
  unlistedProducts,
  addProduct,
  editProduct,
  manageProductDeleteStatus,
  unlistedProductData,
  users,
  login,
  logout,
  category,
  addCategory,
  unlistedCategory,
  usersData,
  userStatus,
  productData,
  manageCategoryStatus,
  editCategory,
  categoryList,
  brands,
  addBrand,
  brandList,
  addColorVarient,
  deleteColorVarient,
  addSizeVarient,
  editSizeVarient,
  deleteSizeVarient,

  getAllColorVarient,
  getAllSizeVarient,
  singleProductData,

  order,
  orderItem,
  changeOrderStatus,

  coupon,
  addCoupon,
  deleteCoupon,

  salesReport,
  salesReportData,
};
