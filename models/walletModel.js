
const mongoose=require("mongoose")

const walletSchema= mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    balance: { type: Number, required: true },
    history: [{
        date: { type: Date, default:Date.now },
        type: { type: String, required: true },
        amount: { type: Number, required: true },
        description: { type: String },
    }]
})

module.exports=mongoose.model('Wallet', walletSchema)