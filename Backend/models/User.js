const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = new Schema({

    username:{
        type:String,
        required:true,
        trim:true,
        minlength:2,
        maxlength:40
    },

    email:{
        type:String,
        lowercase:true,
        unique:true,
        required:true,
        trim:true
    },

    emailOTP:{
        type:String
    },

    mobileOTP:{
        type:String
    },

    otpExpiry:{
        type:Date
    },

    phoneNumber:{
        type:String,
        required:true,
        trim:true
    },

    role:{
        type:String,
        enum:['admin','student'],
        default:"student"
    },

    profilePic:{
        type:String,
        default:""
    },
    lastProfileUpdate:{
        type:Date
    },
    aadhar:{
        type:String,
        required:true,
        trim:true,
        minlength:12,
        maxlength:12,
        unique:true
    },

    isResident:{
        type:Boolean,
        default:false
    },
    address: {
        village: {
            type: String,
            trim: true
        },
        city: {
            type: String,
            trim: true
        },
        state: {
            type: String,
            trim: true
        },
        pincode: {
            type: String,
            trim: true
        },
        country: {
            type: String,
            default: "India",
            trim: true
        }
    }

},{
    timestamps:true
});

module.exports = mongoose.model('User',userSchema);