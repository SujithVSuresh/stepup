const mongoose = require("mongoose");

 
const userSchema = new mongoose.Schema({
    firstName: {type: String, required:true},
    lastName: {type: String, required: true},
    email: {type: String, required:true},
    password: {type: String, required: false},
    phone: {type: String, required:false},
    isBlocked: {type:Boolean},
    dateJoined: {type: Date}
})

module.exports = mongoose.model("User", userSchema)