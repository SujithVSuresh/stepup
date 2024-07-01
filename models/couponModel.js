const mongoose=require("mongoose")

const couponSchema= mongoose.Schema({

    couponCode: {
         type: String
    },
    discountPercentage: { 
        type: Number  
    },
    maxOfferLimit: { 
        type: Number  
    },
    minOrderAmount: { 
        type: Number
    },
    // ttl
    expiryDate:{ 
        type: Date,
        index:{expires:0} 
    }

})

module.exports = mongoose.model('Coupon', couponSchema)