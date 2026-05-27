const mongoose = require('mongoose');

const { Schema } = mongoose;

const installmentSchema = new Schema({

    amount:{
        type:Number,
        required:true
    },

    dueDate:{
        type:Date
    },

    status:{
        type:String,
        enum:['pending','paid'],
        default:'pending'
    },

    paidAt:{
        type:Date
    }

},{_id:true});

const feeSchema = new Schema({

    studentId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Student',
        required:true
    },
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    feeType:{
        type:String,
        enum:['hostel','registration'],
        required:true
    },

    totalAmount:{
        type:Number,
        required:true
    },

    installments:[installmentSchema]

},{timestamps:true});

module.exports = mongoose.model('Fee',feeSchema);