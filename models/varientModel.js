const mongoose = require("mongoose");


const varientSchema = new mongoose.Schema({
    colorName: {type: String, required:true},
    colorCode: {type: String, required:true},
    images: [{type: String}],
    product: {type:mongoose.Schema.Types.ObjectId, ref: "Product", required:true},
    isDelete: {type: Boolean, default:false, required:true},
})


module.exports = mongoose.model("Varient", varientSchema)