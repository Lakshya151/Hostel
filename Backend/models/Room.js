const mongoose = require('mongoose');
const { Schema } = mongoose;

const roomSchema = new Schema({

   roomNo:String,

   floor:String,

   capacity:{
      type:Number,
      enum:[2,3]
   },

   student:[{
      type:mongoose.Schema.Types.ObjectId,
      ref:"User"
   }]

});

module.exports = mongoose.model('Room', roomSchema);