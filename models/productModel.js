const mongoose = require("mongoose");


const productSchema = new mongoose.Schema({

    modelName: {type: String, required:true},
    brand: {type: String, required:true},
    quantity: {type: Number, required: true},
    size: [{type: Number}],
    color: {type: String, required:true},
    gender: {type: String, required: true},
    occasion: {type: String, required: true},
    outerMaterial: {type: String, required: true},
    soleMaterial: {type:String, required: true},
    description: {type:String, required: true},
    images: [{type: String}],
    price: {type: Number, required: true},
    category: {type:mongoose.Schema.Types.ObjectId, ref: "Category", required:true},
    isDelete: {type: Boolean, default:false, required:true},

})

module.exports = mongoose.model("Product", productSchema)