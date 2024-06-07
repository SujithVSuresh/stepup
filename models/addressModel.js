const mongoose=require("mongoose")

const addressSchema= mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId },
    address:[{
        name:{ type: String },
        phoneNumber: { type: String },
        pincode:{ type: String },
        landmark:{ type: String },
        state:{ type: String },
        cityDistrictTown:{ type: String },
        localityAreaStreet:{ type: String },
        housenoBuildingApartment: {type: String}
    }] 
})

module.exports=mongoose.model('Address', addressSchema)