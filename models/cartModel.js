const mongoose = require("mongoose");


const cartSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Subvarient", required: true },
        quantity: { type: Number, required: true, default: 1, min: 1 }
    }]
})

module.exports = mongoose.model("Cart", cartSchema)



