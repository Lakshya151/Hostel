const mongoose = require("mongoose");

const kycSchema = new mongoose.Schema({

    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    aadharFront:{
        type:String,
        required:true
    },

    aadharBack:{
        type:String,
        required:true
    },
    selfie:{
        type:String,
        required:true
    },

    status:{
        type:String,
        enum:["pending","approved","rejected"],
        default:"pending"
    },

    rejectionReason:{
        type:String,
        default:null
    },

    verifiedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },

    verifiedAt:{
        type:Date
    }

},{
    timestamps:true
});

module.exports=mongoose.model("KYC",kycSchema);