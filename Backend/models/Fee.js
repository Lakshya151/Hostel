const mongoose=require('mongoose');
const {Schema}=mongoose;

const feeSchema=new Schema({

    studentId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Student'
    },
    amount:{
        type:Number,
        required:true
    },
    feeType:{
        type:String,
        enum:[
            'hostel',
            'mess',
            'bus'
        ]
    },
    dueDate:{
        type:Date
    },
    status:{
        type:String,
        enum:['paid','unpaid'],
        default:'unpaid'
    }

},{timestamps:true});

module.exports=mongoose.model('Fee',feeSchema);