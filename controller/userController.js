const User = require("../models/userModel");
const Product = require("../models/productModel");
const Subvarient = require("../models/subVarientModel");
const Varient = require("../models/varientModel");
const Cart = require("../models/cartModel");
const Address = require("../models/addressModel");

const { v4: uuidv4 } = require("uuid");

const bcrypt = require("bcrypt");
const sendMail = require("../util/mailSender");

const generateOtp = require("../util/generateOtp");

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

    // if (req.isAuthenticated()) {
    //   req.logout((err) => {
    //     if (err) {
    //       return next(err);
    //     }
    //   });
    // }

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
      console.log(
        resetPasswordToken,
        req.session.resetPassword.resetPasswordToken,
        req.session.resetPassword.resetPasswordEmail,
        "hey poor guy..."
      );
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
        return res
          .status(409)
          .json({
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
      console.log("razik.....", req.session.cartCount);

      res.render("user/shop", {
        isLogin: true,
        cartCount: req.session.cartCount,
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
      let varients = await Varient.find({}).populate("product");
      let products = await Product.find({ isDelete: false }).populate(
        "category"
      );
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

      res.status(200).json({ products: mappedProduct });
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

      res.status(200).json({ cartData: cart });
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

      console.log(itemId);

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
          console.log(cart.items[itemIndex].quantity, "Hey diii...");
          console.log(cart, "kiio");
          if (
            cart.items[itemIndex].productId.quantity <
            cart.items[itemIndex].quantity
          ) {
            cart.items[itemIndex].quantity =
              cart.items[itemIndex].productId.quantity - 1;
          } else {
            cart.items[itemIndex].quantity -= 1;
          }
          await cart.save();
          return res.status(200).json({
            message: "Item quantity decremented successfully",
            updatedItem: cart.items[itemIndex],
            cartItem: cart.items,
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
          return res.status(200).json({
            message: "Item quantity incremented successfully",
            updatedItem: cart.items[itemIndex],
            cartItem: cart.items,
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
        return res.status(200).json({
          message: "Item removed from cart.",
          cartData: cart,
          cartCount: req.session.cartCount,
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
        { path: "items.productId" },
      ]);

      res.render("user/checkout", {
        isLogin: true,
        address,
        cart,
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

      res.render("user/profile", { isLogin: true, user });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const editProfile = async (req, res) => {
  try{
    if(req.method == "POST"){
      const userId = req.session.userId
      const {firstName, lastName, phoneNumber} = req.body

      console.log(firstName, lastName, phoneNumber, "hooi");
      const user = await User.findOne({ _id: userId });

      if(user){
        user.firstName = firstName
        user.lastName = lastName
        user.phone = phoneNumber
        await user.save()
        res.status(200).json({ message: "Profile updated successfully.", data: user});
      }

    }

  }catch(error){
    res.status(500).json({ error: error.message });

  }
}

const changePassword = async (req, res) => {
  try {
    if (req.method == "GET") {
      res.render("user/changePassword", { isLogin: true });
    }

    if (req.method == "POST") {
      const { currentPassword, newPassword } = req.body;
      const userId = req.session.userId;

      console.log(currentPassword, newPassword, "password,,,,....");

      const user = await User.findOne({
        _id: userId,
        password: { $exists: true },
      });

      const passwordChecker = await bcrypt.compare(currentPassword, user.password)



      if (user && passwordChecker) {
        user.password = newPassword
        await user.save()
        return res.status(200).json({ message: "Password changed successfully." });
        
      } else if(!passwordChecker) {
        return res.status(409).json({ message: "The current password you entered is incorrect." });
      }else if(!user){
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
  try{
    if(req.method == "GET"){

      const userId = req.session.userId;

      const address = await Address.findOne({ userId: userId });

      res.render("user/address", { isLogin: true, address });

    }

  }catch(error){
    res.status(500).json({ error: error.message });
  }
}


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

      console.log(fullName, state, cityDistrictTown, "hey cool baby.....");

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

      return res.status(200).json({ message: "Address created successfully.", data: address.address[address.address.length - 1]});
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
  address
  // showAddress
  // fetchProductDetails
};
