const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },

    description:{
        type:String,
        required:true
    },

    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    expiresAt:{
        type:Date,
        required:true,
        index:{ expires: 0 }
    }

},{timestamps:true});

module.exports=mongoose.model('Announcement',announcementSchema);