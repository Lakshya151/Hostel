const mongoose=require('mongoose');
const {Schema}= mongoose;

const complaintSchema=new Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    roomNo:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Student",
        required:true,
    },
    title:{
        type:String,
        required:true,
        trim:true,
        min:2,
        max:20
    },
    description:{
        type:String,
        trim:true,
        min:2,
        max:70
    },
    status:{
        type:String,
        enum:['resolve','pending'],
        default:'pending'
    }
},{timestamps:true})

module.exports=mongoose.model('Complaint',complaintSchema);