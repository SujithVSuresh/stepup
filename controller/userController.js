
const User = require('../models/userModel')
const Product = require('../models/productModel')
const Subvarient = require('../models/subVarientModel')
const Varient = require('../models/varientModel')


const bcrypt = require('bcrypt')
const sendMail = require('../util/mailSender')

const generateOtp = require('../util/generateOtp')


const home = async (req, res) => {
    try{
    res.render('user/home', {isLogin: req.session.userId || req.isAuthenticated() ? true : false})
} catch (error) {
    res.status(500).json({ error: error.message });
  }
}


const signup = async (req, res) => {
    try{
    if(req.method == "GET"){
        console.log("4")
    res.render('user/signup', {isLogin: false})
    }

    if(req.method == "POST"){

        const { fname, lname, email, phone, password } = req.body;

        const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    
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

} catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const signin = async (req, res) => {
    try{
    if(req.method == "GET"){
    res.render('user/signin', {isLogin: false})
    }

    if(req.method == "POST"){
        const { email, password } = req.body;
        console.log(email, password);

        const user = await User.findOne({ email: email,  password: { $exists: true } });
        console.log(user, "iiooii")

        if(user && (await bcrypt.compare(password, user.password))){
            console.log("kioooooooooopppppppppppp");
            req.session.userId = user._id;

            console.log(req.session.userId);
            res.status(200).json({ message: "login successfull" });
        }else{
            res.status(404).json({ message: "No user found with these credentials" });
        }

    }

} catch (error) {
    res.status(500).json({ error: error.message });
  }
}


const logout = (req, res) => {
    try{
    if (req.session.userId) {
      delete req.session.userId;

    }

    if(req.isAuthenticated()){
        req.logout(err => {
            if (err) {
              return next(err);
            }
        
          });

    }
  
    res.redirect("/signin");

} catch (error) {
    res.status(500).json({ error: error.message });
  }
  };


const otp = async (req, res) => {
    try{
    res.render('user/otp', {isLogin: false})
} catch (error) {
    res.status(500).json({ error: error.message });
  }
}





const otpMailSender = async (req, res) => {
    try{
    const email = req.session.user.email
    const otp = await generateOtp()

    req.session.otp = otp

    const mailResponse = await sendMail(email, "Verification Email", `This is your OTP ${otp}`)

    if(mailResponse){

        res.status(200).json({msg: "mail send successfully"})
    }else{
        res.status(500).json({msg: "mail not send successfully"})
    }
} catch (error) {
    res.status(500).json({ error: error.message });
  }                                
}


const verifyOtp = async (req, res) => {
    try{
 
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

} catch (error) {
    res.status(500).json({ error: error.message });
  }
}


const shop = async (req, res) => {
    try{
    if(req.method === "GET"){
        res.render("user/shop", {isLogin: true})
    }
} catch (error) {
    res.status(500).json({ error: error.message });
  }
}


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
            let products = await Product.find({}).populate("category");
            let subVarients = await Subvarient.find({});

            // Filter and map the products with their corresponding varients and subvarients
            let mappedProduct = products.map((product) => {
                let filteredVarients = varients
                    .filter((varient) => varient.product._id.toString() === product._id.toString())
                    .map((varient) => {
                        let filteredSubvarients = subVarients.filter(
                            (subVarient) => subVarient.varient.toString() === varient._id.toString()
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
    try{
    if(req.method === "GET"){
        let productId = req.params.productId
        

        let subVarient = await Subvarient.findOne({product: productId}).populate("varient")

        


         console.log("abhii", subVarient.varient._id)


        res.render("user/product-detail", {productId: productId, varientId: subVarient.varient._id, isLogin: true})
    }
} catch (error) {
    res.status(500).json({ error: error.message });
  }
}


const productDetails = async (req, res) => {
    try{
    if(req.method === "GET"){
        let productId = req.query.pid
        let varientId = req.query.vid
        let subVarientId = req.query.svid

        if(subVarientId && !productId && !varientId){
            let selectedSubVarientDetails = await Subvarient.findOne({_id: subVarientId})
            res.status(200).json({subVarient: selectedSubVarientDetails})

        }

        if(productId && varientId && !subVarientId){

        let product = await Product.findOne({_id: productId}).populate('category')

        let allVarients = await Varient.find({product: productId})

        let selectedVarients = await Varient.find({_id: varientId})

        let selectedSubVarients = await Subvarient.find({product: productId, varient: varientId})
        

        res.status(200).json({product: product, allVarients:allVarients, selectedVarients: selectedVarients, selectedSubVarients:selectedSubVarients})
        }
    }
} catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// const fetchProductDetails = async (req, res) => {
//         let productId = req.query.pid
//         console.log(productId);

//         let productDetails = await Product.findOne({_id: productId}).populate('category')

//         console.log(productDetails)

//         res.status(200).json({productDetails: productDetails})
// }

module.exports = {
    home,
    signin,
    signup,
    otp,
    otpMailSender,
    verifyOtp,
    shop,
    items,
    productDetailsPage,
    productDetails,
    logout
    // fetchProductDetails
}