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
    }

},{
    timestamps:true
});

module.exports = mongoose.model('User',userSchema);