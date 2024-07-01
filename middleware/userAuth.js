const User = require("../models/userModel");

const isLogin = async (req, res, next) => {
  if (req.session.userId) {
    let user = await User.findOne({
      _id: req.session.userId,
      isBlocked: false,
    });

    if (user) {
      next();
    } else {
      if (req.session.userId) {
        delete req.session.userId;
      }else if(req.session.gUser){
        delete req.session.gUser
      }
  
      res.redirect("/signin");
    }
  } else {
    console.log("hey redirect response", req.originalUrl)
    req.session.redirectTo = req.originalUrl;
    res.redirect("/signin");
  }
};

const isLogout = (req, res, next) => {
  if (!req.session.userId) {
    next();
  } else {
    res.redirect("/");
  }
};



const isGoogleUser = (req, res, next) => {
    if(!req.session.gUser){
      next();
    }else{
      res.redirect('/profile')
    }
};


module.exports = {
  isLogin,
  isLogout,
  isGoogleUser
};
