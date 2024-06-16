const mongoose = require("mongoose");


const productSchema = new mongoose.Schema({
    modelName: {type: String, required:true},
    brand: {type:mongoose.Schema.Types.ObjectId, ref: "Brand", required:true},
    gender: {type: String, required: true},
    outerMaterial: {type: String, required: true},
    soleMaterial: {type:String, required: true},
    description: {type:String, required: true},
    category: {type:mongoose.Schema.Types.ObjectId, ref: "Category", required:true},
    isDelete: {type: Boolean, default:false, required:true},
    isActive: {type: Boolean, default:false, required:true},
    date: {
        type: Date,
        default: Date.now,
      },
})

module.exports = mongoose.model("Product", productSchema)