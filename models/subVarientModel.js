const mongoose = require("mongoose");


const subVarientSchema = new mongoose.Schema({
    size: {type: String, required:true},
    quantity: {type: Number, required: true},
    price: {type: Number, required: true},
    product: {type:mongoose.Schema.Types.ObjectId, ref: "Product", required:true},
    varient: {type:mongoose.Schema.Types.ObjectId, ref: "Varient", required:true},
    isDelete: {type: Boolean, default:false, required:true},
})

module.exports = mongoose.model("Subvarient", subVarientSchema)