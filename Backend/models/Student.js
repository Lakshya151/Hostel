const mongoose=require('mongoose');
const User = require('./User');
const {Schema}= mongoose;

const studentSchema=new Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    roomNo:{
        type:String,
        required:true,
        trim:true
    },
    course:{
        type:String,
        required:true,
        trim:true
    },
    collegeName:{
        type:String,
        required:true,
        trim:true,
        maxlength:70
    },
    year:{
        type:String,
        enum:['1','2','3','4','5'],
        required:true
    },
    guardianName:{
        type:String,
        required:true,
        trim:true,
        min:2,
        max:40
    },
    guardianPhone:{
        type:String,
        required:true,
        trim:true,
        min:10,
        max:12
    },
    feeDue:{
        type:String,
        required:true
    },
    onLeave:{
        type:Boolean,
        default:false
    }
})

module.exports=mongoose.model('Student',studentSchema);