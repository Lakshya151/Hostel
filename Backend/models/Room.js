const mongoose=require('mongoose');
const {Schema}=mongoose;

const roomSchema=new Schema({
    roomNo:{
        type:String,
        required:true,
        trim:true
    },
    floor:{
        type:String,
        required:true,
        trim:true
    },
    capacity:{
        type:String,
        enum:['double','triple'],
        required:true,
        trim:true
    },
    occupied:{
        type:String,
        enum:['fullyOccupied','halfOccupied','empty'],
        required:true,
        trim:true
    },
    student:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }]
},{timestamps:true});

module.exports=mongoose.model('Room',roomSchema);