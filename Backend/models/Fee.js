const mongoose=require('mongoose');
const {Schema}=mongoose;

const feeSchema=new Schema({
    studentId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Student",
        required:true
    },
    amount:{
        type:String,
        required:true,
        trim:true
    },
    dueDate:{
        type:Date,
        required:true,
        trim:true
    },
    status:{
        type:String,
        enum:['paid','unpaid'],
        required:true,
        trim:true
    },
    paymentId:{
        type:String,
        trim:true
    }
},{timestamps:true});

module.exports=mongoose.model('Fee',feeSchema);