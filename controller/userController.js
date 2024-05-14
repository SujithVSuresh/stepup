
const User = require('../models/userModel')
const Product = require('../models/productModel')


const bcrypt = require('bcrypt')
const sendMail = require('../util/mailSender')

const generateOtp = require('../util/generateOtp')


const home = async (req, res) => {
    res.render('user/home')
}


const signup = async (req, res) => {
    if(req.method == "GET"){
        console.log("4")
    res.render('user/signup')
    }

    if(req.method == "POST"){

        const { fname, lname, email, phone, password } = req.body;
    
        const hashedPassword = await bcrypt.hash(password, 10);

        req.session.user = {
            fname: fname,
            lname: lname,
            email: email, 
            phone: phone,
            password: hashedPassword
        }

    const otp = await generateOtp()

    req.session.otp = otp

    const mailResponse = await sendMail(email, "Verification Email", `This is your OTP ${otp}`)
      
      res.status(200).json({message: "User created successfully."})

    }
}

const signin = async (req, res) => {
    if(req.method == "GET"){
    res.render('user/signin')
    }

    if(req.method == "POST"){
        const { email, password } = req.body;
        console.log(email, password);

        const user = await User.findOne({ email: email });
        console.log(user, "iiooii")

        if(user && (await bcrypt.compare(password, user.password))){
            req.session.userId = user._id;
            res.status(200).json({ message: "login successfull" });
        }else{
            res.status(400).json({ message: "No user found with these email and password" });
        }

    }
}


const otp = async (req, res) => {
    res.render('user/otp')
}


const otpMailSender = async (req, res) => {
    const email = req.session.user.email
    const otp = await generateOtp()

    req.session.otp = otp

    const mailResponse = await sendMail(email, "Verification Email", `This is your OTP ${otp}`)

    if(mailResponse){
        console.log("hi", mailResponse)
        res.status(200).json({msg: "mail send successfully"})
    }else{
        res.status(500).json({msg: "mail not send successfully"})
    }                                
}


const verifyOtp = async (req, res) => {
 
    if(req.session.otp == req.body.otpVal){
        console.log("otp is same")
        const newUser = new User({
            firstName: req.session.user.fname,
            lastName: req.session.user.lname,
            email: req.session.user.email,
            phone: req.session.user.phone,
            password: req.session.user.password,
            isBlocked: false,
            dateJoined: Date()
          });

          await newUser.save();

          req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
            } else {
                console.log('Session destroyed');
            }
        });
          res.status(200).json({msg: "User created & verified successfully"})
    }else{
        res.status(400).json({ message: 'Invalid OTP. Please try again.' });
    }
}


const shop = async (req, res) => {
    if(req.method === "GET"){
        res.render("user/shop")
    }
}


const items = async (req, res) => {
    if(req.method === "GET"){
        console.log("jio");
        let products = await Product.find({}).populate('category');

        console.log(products)
        res.status(200).json({items: products})


    }
}


const productDetail = async (req, res) => {
    if(req.method === "GET"){
        let productId = req.params.productId
        res.render("user/product-detail", {productId: productId})
    }
}

const fetchProductDetails = async (req, res) => {
        let productId = req.query.pid
        console.log(productId);

        let productDetails = await Product.findOne({_id: productId}).populate('category')

        console.log(productDetails)

        res.status(200).json({productDetails: productDetails})
}

module.exports = {
    home,
    signin,
    signup,
    otp,
    otpMailSender,
    verifyOtp,
    shop,
    items,
    productDetail,
    fetchProductDetails
}