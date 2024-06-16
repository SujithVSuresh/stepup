const mongoose=require("mongoose")

const addressSchema= mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId },
    address:[{
        name:{ type: String, required:true},
        phoneNumber: { type: String, required:true },
        pincode:{ type: String, required:true },
        landmark:{ type: String, required:false },
        state:{ type: String, required:true },
        cityDistrictTown:{ type: String, required:true },
        localityAreaStreet:{ type: String, required:true },
        housenoBuildingApartment: {type: String, required:true }
    }] 
})

module.exports=mongoose.model('Address', addressSchema)