const Cart = require('../models/cartModel')


const cartCount = async (req, res, next) => {
    if (req.session.userId) {

        const cart = await Cart.findOne({userId: req.session.userId})

        req.session.cartCount = cart.items.length ? cart.items.length : 0 


    }else{
        req.session.cartCount = 0

    }
    next();
  };

  module.exports = {
    cartCount
  };