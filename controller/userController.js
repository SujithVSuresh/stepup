const User = require("../models/userModel");
const Product = require("../models/productModel");
const Subvarient = require("../models/subVarientModel");
const Varient = require("../models/varientModel");
const Cart = require("../models/cartModel");
const Address = require("../models/addressModel");
const Order = require("../models/orderModel");
const Category = require("../models/categoryModel");
const Brand = require("../models/brandModal");

const { v4: uuidv4 } = require("uuid");

const bcrypt = require("bcrypt");
const sendMail = require("../util/mailSender");

const generateOtp = require("../util/generateOtp");

const findTotalAmount = (item) => {
  let totalPrice = 0;
  let shippingPrice = 0;
  let totalAmount = 0;

  if (item.length != 0) {
    item.forEach((k) => {
      totalPrice += k.quantity * k.productId.price;
    });

    if (totalPrice >= 1000) {
      shippingPrice = 0;
    } else {
      shippingPrice = 50;
    }

    totalAmount = totalPrice + shippingPrice;
  }

  return { totalPrice, shippingPrice, totalAmount };
};

const home = async (req, res) => {
  try {
    res.render("user/home", {
      isLogin: req.session.userId || req.isAuthenticated() ? true : false,
      cartCount: req.session.userId ? req.session.cartCount : 0,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

let googleSuccess = async (req, res) => {
  try {
    let user = await User.findOne({ email: req.user.emails[0].value });

    if (!user) {
      user = new User({
        firstName: req.user.name.given_name,
        lastName: req.user.name.family_name,
        email: req.user.emails[0].value,
        isBlocked: false,
        dateJoined: Date(),
      });
      await user.save();
    }

    const cart = await Cart.findOne({ userId: user._id });

    req.session.cartCount = cart.items.length ? cart.items.length : 0;

    req.session.userId = user._id;
    req.session.gUser = true

    res.redirect("/");
  } catch (error) {
    console.error("Error during user logic:", error);
    return done(error);
  }
};

const signup = async (req, res) => {
  try {
    if (req.method == "GET") {
      console.log("4");
      res.render("user/signup", { isLogin: false });
    }

    if (req.method == "POST") {
      const { fname, lname, email, phone, password } = req.body;

      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return res
          .status(400)
          .json({ message: "User with this email already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      req.session.user = {
        fname: fname,
        lname: lname,
        email: email,
        phone: phone,
        password: hashedPassword,
      };

      const otp = await generateOtp();

      req.session.otp = otp;

      const mailResponse = await sendMail(
        email,
        "Verification Email",
        `This is your OTP ${otp}`
      );

      res.status(200).json({ message: "User created successfully." });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const signin = async (req, res) => {
  try {
    if (req.method == "GET") {
      res.render("user/signin", { isLogin: false });
    }

    if (req.method == "POST") {
      const { email, password } = req.body;
      console.log(email, password);

      const user = await User.findOne({
        email: email,
        password: { $exists: true },
      });
      console.log(user, "iiooii");

      if (user && (await bcrypt.compare(password, user.password))) {
        req.session.userId = user._id;

        const cart = await Cart.findOne({ userId: user._id });

        req.session.cartCount = cart.items.length ? cart.items.length : 0;

        console.log(req.session.userId);
        res.status(200).json({ message: "login successfull" });
      } else {
        res
          .status(404)
          .json({ message: "No user found with these credentials" });
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const logout = (req, res) => {
  try {
    console.log("HEY ", req.session.userId);
    if (req.session.userId) {
      delete req.session.userId;
    }
    if(req.session.gUser){
      delete req.session.gUser
    }

    res.redirect("/signin");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const otp = async (req, res) => {
  try {
    res.render("user/otp", { isLogin: false });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    if (req.method == "GET") {
      const resetPasswordToken = req.query.resetPasswordToken;
      if (req.session.resetPassword.resetPasswordToken == resetPasswordToken) {
        res.render("user/resetPassword", { isLogin: false, cartCount: 0 });
      } else {
        console.log("token doesn't match");
      }
    }

    if (req.method == "POST") {
      const { password } = req.body;

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.findOne({
        email: req.session.resetPassword.resetPasswordEmail,
      });

      if (user && user.password) {
        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({ msg: "Password changed successfully" });
      } else if (user && !user.password) {
        return res.status(409).json({
          msg: "User with this account belongs to googlee authentication. Changing password is not possible.",
        });
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const resetPasswordEmail = async (req, res) => {
  try {
    if (req.method == "GET") {
      res.render("user/resetPasswordEmail", { isLogin: false, cartCount: 0 });
    }

    if (req.method == "POST") {
      const { email } = req.body;

      const user = await User.findOne({ email: email });

      console.log(email, "hey emailll....");

      if (user) {
        const resetPasswordToken = uuidv4();

        req.session.resetPassword = {
          resetPasswordToken: resetPasswordToken,
          resetPasswordEmail: email,
        };

        // Send reset email
        const mailResponse = await sendMail(
          email,
          "Password Reset Email",
          `Reset your password with the link http://localhost:3000/password/reset?resetPasswordToken=${resetPasswordToken}`
        );
      }

      res.status(200).json({
        message:
          "If an account with that email exists, a password reset link has been sent.",
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const otpMailSender = async (req, res) => {
  try {
    const email = req.session.user.email;
    const otp = await generateOtp();

    req.session.otp = otp;

    const mailResponse = await sendMail(
      email,
      "Verification Email",
      `This is your OTP ${otp}`
    );

    if (mailResponse) {
      res.status(200).json({ msg: "mail send successfully" });
    } else {
      res.status(500).json({ msg: "mail not send successfully" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const verifyOtp = async (req, res) => {
  try {
    if (req.session.otp == req.body.otpVal) {
      console.log("otp is same");
      const newUser = new User({
        firstName: req.session.user.fname,
        lastName: req.session.user.lname,
        email: req.session.user.email,
        phone: req.session.user.phone,
        password: req.session.user.password,
        isBlocked: false,
        dateJoined: Date(),
      });

      await newUser.save();

      req.session.destroy((err) => {
        if (err) {
          console.error("Error destroying session:", err);
        } else {
          console.log("Session destroyed");
        }
      });
      res.status(200).json({ msg: "User created & verified successfully" });
    } else {
      res.status(400).json({ message: "Invalid OTP. Please try again." });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const shop = async (req, res) => {
  try {
    if (req.method === "GET") {
      const cartCount = req.session.cartCount;

      const filterCategory = await Category.find({});
      const filterBrand = await Brand.find({});

      res.render("user/shop", {
        isLogin: req.session.userId ? true : false,
        cartCount: req.session.userId ? req.session.cartCount : 0,
        filterCategory,
        filterBrand,
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// const items = async (req, res) => {
//     try{
//     if(req.method === "GET"){
//         let varients = await Varient.find({}).populate("product");

//         let products = await Product.find({}).populate("category");

//         let subVarients = await Subvarient.find({})

//         res.status(200).json({varients: varients, products: products, subVarients: subVarients})

//     }
// } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// }

const items = async (req, res) => {
  try {
    if (req.method === "GET") {
      const sort = req.query.sort;
      const search = req.query.search.toLowerCase();
      const categories = req.query.category.split(",");
      const brands = req.query.brand.split(",");
      const gender = req.query.gender.split(",");
      const color = req.query.color.split(",");
      const size = req.query.size.split(",");
      const price = req.query.price.split(",");

      console.log(price, "price");

      let products = await Product.find({ isDelete: false })
        .populate("category")
        .populate("brand");

      console.log(products, "hey products...");

      let varients = await Varient.find({}).populate("product");
      let subVarients = await Subvarient.find({});

      // Filter and map the products with their corresponding varients and subvarients
      let mappedProduct = products.map((product) => {

        let filteredVarients = varients
          .filter(
            (varient) =>
              varient.product._id.toString() === product._id.toString()
          )
          .map((varient) => {
            let filteredSubvarients = subVarients.filter(
              (subVarient) =>
                subVarient.varient.toString() === varient._id.toString()
            );
            return { ...varient._doc, subVarients: filteredSubvarients };
          });

        return { ...product._doc, varients: filteredVarients };
      });

      let filteredProducts = mappedProduct;

      if (categories[0] != "") {
        filteredProducts = filteredProducts.filter((product) => {
          if (categories.includes(product.category.categoryName)) {
            return product;
          }
        });
      }

      if (brands[0] != "") {
        filteredProducts = filteredProducts.filter((product) => {
          if (brands.includes(product.brand.name)) {
            return product;
          }
        });
      }

      if (gender[0] != "") {
        filteredProducts = filteredProducts.filter((product) => {
          if (gender.includes(product.gender)) {
            return product;
          }
        });
      }

      if (color[0] != "") {
        filteredProducts = filteredProducts.filter((product) => {
          let filterVarients = product.varients.filter((varient) => {
            if (color.includes(varient.colorName.toLowerCase())) {
              return varient;
            }
          });

          if (filterVarients.length != 0) {
            return product;
          }
        });
      }

      if (size[0] != "") {
        filteredProducts = filteredProducts.filter((product) => {
          let count = 0

          product.varients.forEach((varient) => {
            let filterSubVarients = varient.subVarients.filter((item) => {
              if(size.includes(item.size)){
                return item
              }
            })

            if(filterSubVarients.length != 0){
              count++;
            }
          });

          if(count>0){
            return product
          }
        });
      }




      if (price[0] != "") {
        filteredProducts = filteredProducts.filter((product) => {
          let count = 0

          product.varients.forEach((varient) => {
            console.log("Hey varient", varient);
            let filterSubVarients = varient.subVarients.filter((item) => {
              if(price.includes("0-500")){
                if(item.price >= 1 && item.price <=500){
                  return item
                }
              }else if(price.includes("501-1000")){
                if(item.price >= 501 && item.price <=1000){
                  return item
                }
              }else if(price.includes("1001-1500")){
                if(item.price >= 1001 && item.price <=1500){
                  return item
                }
              }else if(price.includes("1501-2000")){
                if(item.price >= 1501 && item.price <=2000){
                  return item
                }
              }else if(price.includes("2001-2500")){
                if(item.price >= 2001 && item.price <=2500){
                  return item
                }
              }else if(price.includes("2501-3000")){
                if(item.price >= 2501 && item.price <=3000){
                  return item
                }
              }else if(price.includes("3001-10000")){
                if(item.price >= 3001){
                  return item
                }
              }
                
            })
            console.log("filtered...", filterSubVarients);

            if(filterSubVarients.length != 0){
              count++;
            }
          });

          if(count>0){
            return product
          }
        });
      }



      if (search != "") {
        filteredProducts = filteredProducts.filter((product) => {
          if (product.modelName.toLowerCase().includes(search)) {
            return product;
          }
        });
      }

      if (sort == "name-atoz") {
        console.log("sort,", sort);
        filteredProducts.sort((a, b) => {
          if (a.modelName < b.modelName) {
            return -1;
          }
          if (a.modelName > b.modelName) {
            return 1;
          }
          return 0;
        });
      } else if (sort == "name-ztoa") {
        console.log("sort123,", sort, filteredProducts);
        filteredProducts.sort((a, b) => {
          if (a.modelName > b.modelName) {
            return -1;
          }
          if (a.modelName < b.modelName) {
            return 1;
          }
          return 0;
        });
      } else if (sort == "price-asc") {
        console.log(filteredProducts);
        filteredProducts.sort(
          (a, b) =>
            a.varients[0].subVarients[0].price -
            b.varients[0].subVarients[0].price
        );
      } else if (sort == "price-desc") {
        console.log(filteredProducts);
        filteredProducts.sort(
          (a, b) =>
            b.varients[0].subVarients[0].price -
            a.varients[0].subVarients[0].price
        );
      } else {
        filteredProducts.sort((a, b) => b.date - a.date);
      }

      // Pagenation

      const page = parseInt(req.query.page) || 1;
      const limit = 2;

      const skip = (page - 1) * limit;

      const totalProducts = filteredProducts.length;
      const totalPages = Math.ceil(totalProducts / limit);

      const paginatedProducts = filteredProducts.slice(skip, skip + limit);

      res.status(200).json({
        products: paginatedProducts,
        totalPages: totalPages,
        currentPage: page,
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const productDetailsPage = async (req, res) => {
  try {
    if (req.method === "GET") {
      let productId = req.params.productId;

      let subVarient = await Subvarient.findOne({
        product: productId,
      }).populate("varient");

      console.log("abhii", subVarient.varient._id);

      res.render("user/product-detail", {
        productId: productId,
        varientId: subVarient.varient._id,
        isLogin: true,
        cartCount: req.session.cartCount,
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const productDetails = async (req, res) => {
  try {
    if (req.method === "GET") {
      let productId = req.query.pid;
      let varientId = req.query.vid;
      let subVarientId = req.query.svid;

      if (subVarientId && !productId && !varientId) {
        let selectedSubVarientDetails = await Subvarient.findOne({
          _id: subVarientId,
        });
        res.status(200).json({ subVarient: selectedSubVarientDetails });
      }

      if (productId && varientId && !subVarientId) {
        let product = await Product.findOne({ _id: productId }).populate(
          "category"
        );

        let allVarients = await Varient.find({ product: productId });

        let selectedVarients = await Varient.find({ _id: varientId });

        let selectedSubVarients = await Subvarient.find({
          product: productId,
          varient: varientId,
        });

        res.status(200).json({
          product: product,
          allVarients: allVarients,
          selectedVarients: selectedVarients,
          selectedSubVarients: selectedSubVarients,
        });
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const cart = async (req, res) => {
  try {
    if (req.method == "GET") {
      res.render("user/cart", {
        isLogin: true,
        cartCount: req.session.cartCount,
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addedtoCartProducts = async (req, res) => {
  try {
    if (req.method == "GET") {
      let userId = req.session.userId;

      let cart = await Cart.findOne({ userId }).populate([
        { path: "items.productId", populate: { path: "varient" } },
        { path: "userId" },
        { path: "items.productId", populate: { path: "product" } },
      ]);

      // let isModified = false;

      // cart.items.forEach((item) => {
      //   if (
      //     item.productId.quantity < item.quantity &&
      //     item.productId.quantity != 0
      //   ) {
      //     item.quantity = item.productId.quantity;
      //     isModified = true;
      //   }
      // });

      // if (isModified) {
      //   await cart.save();
      //   console.log("Cart quantities updated successfully:", cart);
      // } else {
      //   console.log("No items needed updating.");
      // }

      let totalAmountDetails = findTotalAmount(cart.items);

      console.log(totalAmountDetails, "poo");

      res.status(200).json({ cartData: cart, totalAmountDetails });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const cartQtyManagement = async (req, res) => {
  try {
    if (req.method == "POST") {
      let userId = req.session.userId;
      const { itemId: itemId, qtyUpdateIdentifier: qtyUpdateIdentifier } =
        req.body;

      const cart = await Cart.findOne({ userId: userId }).populate([
        { path: "items.productId" },
      ]);

      const itemIndex = cart.items.findIndex((item) => item._id == itemId);

      if (itemIndex >= 0) {
        if (qtyUpdateIdentifier == 0) {
          if (cart.items[itemIndex].quantity <= 1) {
            return res.status(409).json({
              message: "Quantity limit subceeded",
            });
          }

          if (
            cart.items[itemIndex].productId.quantity <
            cart.items[itemIndex].quantity
          ) {
            cart.items[itemIndex].quantity =
              cart.items[itemIndex].productId.quantity;
          } else {
            cart.items[itemIndex].quantity -= 1;
          }
          await cart.save();

          let totalAmountDetails = findTotalAmount(cart.items);
          return res.status(200).json({
            message: "Item quantity decremented successfully",
            updatedItem: cart.items[itemIndex],
            cartItem: cart.items,
            totalAmountDetails,
          });
        } else if (qtyUpdateIdentifier == 1) {
          if (cart.items[itemIndex].quantity >= 10) {
            return res.status(409).json({
              message: "Quantity limit exceeded",
            });
          } else if (
            cart.items[itemIndex].quantity >=
            cart.items[itemIndex].productId.quantity
          ) {
            return res.status(409).json({
              message: `Insufficient stock. Available stock: ${cart.items[itemIndex].productId.quantity}`,
            });
          }
          cart.items[itemIndex].quantity += 1;
          await cart.save();

          let totalAmountDetails = findTotalAmount(cart.items);
          return res.status(200).json({
            message: "Item quantity incremented successfully",
            updatedItem: cart.items[itemIndex],
            cartItem: cart.items,
            totalAmountDetails,
          });
        }
      }

      //res.status(200).json({ cartData:  cart});
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addToCart = async (req, res) => {
  try {
    if (req.method == "POST") {
      const { productId, quantity } = req.body;

      const userId = req.session.userId;

      let cart = await Cart.findOne({ userId });

      let productQuantity = Number(quantity);

      let subVarient = await Subvarient.findOne({ _id: productId });

      if (subVarient && quantity > subVarient.quantity) {
        if (subVarient.quantity == 0) {
          return res.status(409).json({ message: `Out of stock` });
        }

        return res.status(409).json({
          message: `Only ${subVarient.quantity} items available in stock`,
        });
      }

      if (!cart) {
        cart = new Cart({ userId, items: [] });
      }

      const productIndex = cart.items.findIndex((item) =>
        item.productId.equals(productId)
      );

      console.log("jobb", productIndex);

      if (productIndex > -1) {
        return res
          .status(409)
          .json({ message: "Product already exists in cart", cart });
      } else {
        cart.items.push({ productId: productId, quantity: productQuantity });
        await cart.save();
        if (req.session.cartCount) {
          req.session.cartCount += 1;
        } else {
          req.session.cartCount = 1;
        }
        return res.status(200).json({
          message: "Product added to cart",
          cart,
          cartCount: req.session.cartCount,
        });
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const removeFromCart = async (req, res) => {
  try {
    if (req.method == "POST") {
      const { itemId } = req.body;
      const userId = req.session.userId;

      const cart = await Cart.findOneAndUpdate(
        { userId: userId },
        { $pull: { items: { _id: itemId } } },
        { new: true }
      ).populate("items.productId");

      if (cart) {
        if (req.session.cartCount) {
          req.session.cartCount -= 1;
        } else {
          req.session.cartCount = 0;
        }

        let totalAmountDetails = findTotalAmount(cart.items);

        console.log("kohli", totalAmountDetails);

        return res.status(200).json({
          message: "Item removed from cart.",
          cartData: cart,
          cartCount: req.session.cartCount,
          totalAmountDetails,
        });
      } else {
        return res.status(404).send("Cart not found");
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const checkout = async (req, res) => {
  try {
    if (req.method == "GET") {
      const userId = req.session.userId;

      const address = await Address.findOne({ userId: userId });

      const cart = await Cart.findOne({ userId: userId }).populate([
        { path: "items.productId", populate: { path: "product" } },
      ]);

      console.log(cart.items, "piitt");

      // const filteredIds = cart.items
      //   .filter((item) => item.productId.quantity === 0)
      //   .map((item) => String(item._id));

      // const cartItemDelete = await Cart.findOneAndUpdate(
      //   { userId: userId },
      //   { $pull: { items: { _id: {$in: filteredIds} } } },
      //   { new: true }
      // );

      let totalAmountDetails = findTotalAmount(cart.items);

      console.log("Hey how are you: ", totalAmountDetails);

      res.render("user/checkout", {
        isLogin: true,
        address,
        cart,
        totalAmountDetails,
        cartCount: req.session.cartCount,
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const profile = async (req, res) => {
  try {
    if (req.method == "GET") {
      const userId = req.session.userId;

      const user = await User.findOne({ _id: userId });

      res.render("user/profile", {
        isLogin: req.session.userId ? true : false,
        cartCount: req.session.userId ? req.session.cartCount : 0,
        gUser: req.session.gUser ? true : false,
        user,
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const editProfile = async (req, res) => {
  try {
    if (req.method == "POST") {
      const userId = req.session.userId;
      const { firstName, lastName, phoneNumber } = req.body;

      console.log(firstName, lastName, phoneNumber, "hooi");
      const user = await User.findOne({ _id: userId });

      if (user) {
        user.firstName = firstName;
        user.lastName = lastName;
        user.phone = phoneNumber;
        await user.save();
        res
          .status(200)
          .json({ message: "Profile updated successfully.", data: user });
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    if (req.method == "GET") {
      res.render("user/changePassword", {
        isLogin: req.session.userId ? true : false,
        cartCount: req.session.userId ? req.session.cartCount : 0,
      });
    }

    if (req.method == "POST") {
      const { currentPassword, newPassword } = req.body;
      const userId = req.session.userId;

      console.log(currentPassword, newPassword, "password,,,,....");

      const user = await User.findOne({
        _id: userId,
        password: { $exists: true },
      });

      const passwordChecker = await bcrypt.compare(
        currentPassword,
        user.password
      );

      if (user && passwordChecker) {
        user.password = newPassword;
        await user.save();
        return res
          .status(200)
          .json({ message: "Password changed successfully." });
      } else if (!passwordChecker) {
        return res
          .status(409)
          .json({ message: "The current password you entered is incorrect." });
      } else if (!user) {
        return res.status(409).json({ message: "User not found" });
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// const fetchProductDetails = async (req, res) => {
//         let productId = req.query.pid
//         console.log(productId);

//         let productDetails = await Product.findOne({_id: productId}).populate('category')

//         console.log(productDetails)

//         res.status(200).json({productDetails: productDetails})
// }

const address = async (req, res) => {
  try {
    if (req.method == "GET") {
      const userId = req.session.userId;

      const address = await Address.findOne({ userId: userId });

      res.render("user/address", {
        address,
        isLogin: req.session.userId ? true : false,
        cartCount: req.session.userId ? req.session.cartCount : 0,
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const order = async (req, res) => {
  try {
    if (req.method == "GET") {
      const userId = req.session.userId;

      const orders = await Order.find({ userId: userId });

      console.log(orders);

      res.render("user/order", {
        orders,
        isLogin: userId ? true : false,
        cartCount: userId ? req.session.cartCount : 0,
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    if (req.method == "GET") {
      const userId = req.session.userId;
      const oid = req.query.oid;

      const order = await Order.findOne({ userId: userId, _id: oid });

      console.log(order);

      res.status(200).json({ order: order });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const orderDetail = async (req, res) => {
  try {
    if (req.method == "GET") {
      const userId = req.session.userId;

      // const orders = await Order.find({});

      res.render("user/orderDetail", {
        isLogin: userId ? true : false,
        cartCount: userId ? req.session.cartCount : 0,
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const orderItemDetail = async (req, res) => {
  try {
    if (req.method == "GET") {
      const userId = req.session.userId;
      const orderId = req.query.oid || null
      const itemId = req.query.itid || null

      const order = await Order.findOne({_id: orderId})

      const orderedItem = order.orderedItems.find(item => item._id == itemId);


      const orderAddress = order.address

      const oid = order.orderId

      res.render("user/orderItemDetails", {
        orderId: orderId,
        itemId: itemId,
        orderAddress: orderAddress,
        oid: oid,
        orderedItem: orderedItem,
        isLogin: userId ? true : false,
        cartCount: userId ? req.session.cartCount : 0,
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createAddress = async (req, res) => {
  try {
    if (req.method == "POST") {
      const userId = req.session.userId;
      const {
        fullName,
        state,
        cityDistrictTown,
        zipPostalCode,
        localityAreaStreet,
        housenoBuildingApartment,
        phone,
        landmark,
      } = req.body;

      let address = await Address.findOne({ userId });

      if (!address) {
        address = new Address({ userId: userId, address: [] });
      }

      address.address.push({
        name: fullName,
        state: state,
        cityDistrictTown: cityDistrictTown,
        pincode: zipPostalCode,
        localityAreaStreet: localityAreaStreet,
        housenoBuildingApartment: housenoBuildingApartment,
        phoneNumber: phone,
        landmark: landmark,
      });

      await address.save();

      return res.status(200).json({
        message: "Address created successfully.",
        data: address.address[address.address.length - 1],
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const editAddress = async (req, res) => {
  try {
    if (req.method === "POST") {
      console.log(req.body, "koppp");

      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const {
        fullName,
        state,
        cityDistrictTown,
        zipPostalCode,
        localityAreaStreet,
        housenoBuildingApartment,
        phone,
        landmark,
        addressId
      } = req.body;

      if (!addressId) {
        return res.status(400).json({ error: "Address ID is required" });
      }

      const userAddress = await Address.findOne({ userId });

      if (!userAddress) {
        return res.status(404).json({ error: "User address not found" });
      }

      console.log("mop", userAddress);

      const findAddress = userAddress.address.find(item => item._id.toString() === addressId);

      if (!findAddress) {
        return res.status(404).json({ error: "Address not found" });
      }

      console.log(findAddress, "ayyoo");

      findAddress.name = fullName;
      findAddress.phoneNumber = phone;
      findAddress.pincode = zipPostalCode;
      findAddress.landmark = landmark;
      findAddress.state = state;
      findAddress.cityDistrictTown = cityDistrictTown;
      findAddress.localityAreaStreet = localityAreaStreet;
      findAddress.housenoBuildingApartment = housenoBuildingApartment;
      await userAddress.save();

      return res.status(200).json({
        message: "Address updated successfully.",
      });
    } else {
      return res.status(405).json({ error: "Method Not Allowed" });
    }
  } catch (error) {
    console.error("Error updating address:", error);
    res.status(500).json({ error: error.message });
  }
};


const deleteAddress = async (req, res) => {
  try {
    if (req.method == "POST") {
      const userId = req.session.userId;

      const { addressId } = req.body;

      const result = await Address.updateOne(
        { userId: userId },
        { $pull: { address: { _id: addressId } } }
      );

      if (result.modifiedCount === 0) {
        return res.status(409).json({ message: "No address found." });
      } else {
        return res
          .status(200)
          .json({ message: "Address deleted successfully." });
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const placeOrder = async (req, res) => {
  try {
    const { deliveryAddress, paymentMethod } = req.body;

    const userId = req.session.userId;

    let cart = await Cart.findOne({ userId }).populate([
      { path: "items.productId", populate: { path: "varient" } },
      { path: "userId" },
      { path: "items.productId", populate: { path: "product" } },
    ]);

    cart.items.forEach((item) => {
      if (item.quantity == 0) {
        return res
          .status(409)
          .json({ message: "Out of stock. Update cart to continue." });
      } else if (
        item.quantity != 0 &&
        item.productId.quantity < item.quantity
      ) {
        return res
          .status(409)
          .json({ message: "Insufficient quantity. Update cart to continue." });
      }
    });

    const address = await Address.findOne(
      {
        userId: userId,
        address: { $elemMatch: { _id: deliveryAddress } },
      },
      { "address.$": 1 }
      // It wwill include only the first array elements that matches the condition.
    );

    const totalAmount = findTotalAmount(cart.items);


    async function createOrder(payment) {
      const order = new Order({
        userId: userId,
        orderedItems: [],
        address: {},
      });

      order.address.name = address.address[0].name;
      order.address.phoneNumber = address.address[0].phoneNumber;
      order.address.pincode = address.address[0].pincode;
      order.address.landmark = address.address[0].landmark;
      order.address.state = address.address[0].state;
      order.address.cityDistrictTown = address.address[0].cityDistrictTown;
      order.address.localityAreaStreet = address.address[0].localityAreaStreet;
      order.address.housenoBuildingApartment =
        address.address[0].housenoBuildingApartment;

      order.paymentMethod = paymentMethod;
      order.totalAmount = totalAmount.totalAmount;

      cart.items.forEach((item) => {
        order.orderedItems.push({
          productId: item.productId._id,
          modelName: item.productId.product.modelName,
          brand: item.productId.product.brand,
          gender: item.productId.product.gender,
          outerMaterial: item.productId.product.outerMaterial,
          soleMaterial: item.productId.product.soleMaterial,
          description: item.productId.product.description,
          category: item.productId.product.category,
          quantity: item.quantity,
          price: item.productId.price,
          color: item.productId.varient.colorName,
          size: item.productId.size,
          image: item.productId.varient.images[0],
          orderStatus: payment == "COD" ? "Ordered" : "Pending"
        });
   
      });

      await order.save();

      //  Setting cart empty
      await Cart.updateOne({ userId: userId }, { $set: { items: [] } });

      // Updating header cart qty
      req.session.cartCount = 0;

      // Decrementing quantity.
      const orderById = await Order.findOne({ _id: order._id });

      for (const item of orderById.orderedItems) {
        let subVartient = await Subvarient.findOne({ _id: item.productId });
        let qtyDiff = subVartient.quantity - item.quantity;
        await Subvarient.updateOne(
          { _id: item.productId._id },
          { $set: { quantity: qtyDiff } }
        );
      }

      res.status(200).json({ message: "Order completed successfully." });
    }

    if (paymentMethod == "COD") {
      createOrder("COD");
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const cancelOrder = async (req, res) => {
  if (req.method === "POST") {
    try {
      const { orderId, orderItemId } = req.body;

      const order = await Order.findOne({ _id: orderId });

      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      const orderItem = order.orderedItems.find(item => item._id.toString() === orderItemId);

      if (!orderItem) {
        return res.status(404).json({ error: "Order item not found" });
      }

      if(orderItem.orderStatus == "Cancelled" || orderItem.orderStatus == "Delivered"){
        return res.status(409).json({ error: "Cannot cancel order" });
      }

      orderItem.orderStatus = "Cancelled";
      await order.save();



      const subVartient = await Subvarient.findOne({ _id: order.productId });
      if (subVartient) {
        subVartient.quantity += orderItem.quantity;
        await subVartient.save();
      }

      let count = 0
      order.orderedItems.map((item) => {
        if(item.orderStatus == "Cancelled" || item.orderStatus == "Delivered" || item.orderStatus == "Returned"){
          count++
        }

      })

      if(count==order.orderedItems.length){
        order.orderStatus = "Completed";
        await order.save();

      }


      res.status(200).json({ message: "Order item cancelled successfully" });

    } catch (error) {
      console.error("Error cancelling order:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
};
const orderComplete = async (req, res) => {
  try {
    if (req.method == "GET") {
      res.render("user/orderComplete", {
        isLogin: req.session.userId ? true : false,
        cartCount: req.session.userId ? req.session.cartCount : 0,
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// const showAddress = async (req, res) => {
//   try{
//     const userId = req.session.userId

//     if(req.method == "GET"){
//       const address = await Address.find({userId: userId})

//       return res.status(200).json({data: address})
//     }
//   }catch(error){
//     res.status(500).json({ error: error.message });
//   }
// }

module.exports = {
  home,
  signin,
  signup,

  otp,
  otpMailSender,
  verifyOtp,
  resetPassword,
  resetPasswordEmail,
  shop,
  items,
  productDetailsPage,
  productDetails,
  logout,
  cart,
  addToCart,
  addedtoCartProducts,
  cartQtyManagement,
  removeFromCart,
  checkout,
  profile,
  editProfile,
  changePassword,

  createAddress,
  address,
  deleteAddress,
  editAddress,
  order,
  orderDetail,
  getOrderById,
  orderItemDetail,
  

  placeOrder,
  cancelOrder,
  orderComplete,
  googleSuccess,
  // showAddress
  // fetchProductDetails
};
