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
      res.redirect("/logout");
    }
  } else {
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

module.exports = {
  isLogin,
  isLogout,
};
