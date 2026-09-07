const mongoose=require("mongoose");

const {Schema}=mongoose;

const lunchBoxSchema=new Schema({

    studentId:{
        type:Schema.Types.ObjectId,
        ref:"Student",
        required:true
    },

    date:{
        type:String,
        required:true
    },

    status:{
        type:String,
        enum:["booked","collected"],
        default:"booked"
    },

    bookedAt:{
        type:Date,
        default:Date.now
    },

    collectedAt:{
        type:Date
    }

},{
    timestamps:true
});

lunchBoxSchema.index(
    {studentId:1,date:1},
    {unique:true}
);

module.exports=mongoose.model("LunchBox",lunchBoxSchema);