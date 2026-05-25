const mongoose=require('mongoose');

const paymentSchema=new mongoose.Schema({

    studentId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Student',
        required:true
    },

    feeId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Fee'
    },

    amount:{
        type:Number,
        required:true
    },

    paymentFor:{
        type:String,
        enum:[
            'hostel_fee',
            'registration_fee',
        ],
        required:true
    },

    paymentMethod:{
        type:String,
        enum:[
            'upi',
            'card',
            'netbanking',
            'cash'
        ],
        required:true
    },

    transactionId:{
        type:String
    },

    razorpay_order_id:{
        type:String
    },

    razorpay_payment_id:{
        type:String
    },

    razorpay_signature:{
        type:String
    },

    status:{
        type:String,
        enum:[
            'pending',
            'success',
            'failed',
            'refunded'
        ],
        default:'pending'
    },

    paidAt:{
        type:Date
    },

    receiptUrl:{
        type:String
    },

    remarks:{
        type:String
    }

},{timestamps:true});

module.exports=mongoose.model('Payment',paymentSchema);