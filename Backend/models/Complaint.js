const mongoose=require('mongoose');
const {Schema}= mongoose;

const complaintSchema=new Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    roomNo:{
        type:String,
        required:true,
        trim:true
    },
    title:{
        type:String,
        required:true,
        trim:true,
        minlength:2,
        maxlength:20
    },
    description:{
        type:String,
        trim:true,
        minlength:2,
        maxlength:70
    },
    status:{
        type:String,
        enum:['resolve','pending','in-progress'],
        default:'pending'
    }
},{timestamps:true})

module.exports=mongoose.model('Complaint',complaintSchema);