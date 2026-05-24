const mongoose=require('mongoose');
const {Schema}=mongoose;

const userSchema=new Schema({
    username:{
        type:String,
        required:true,
        trim:true,
        min:2,
        max:40
    },
    email:{
        type:String,
        lowercase:true,
        unique:true,
        required:true,
        trim:true
    },
    password:{
        type:String,
        required:true,
        trim:true
    },
    role:{
        type:String,
        enum:['admin','student'],
        default:student
    },
    profilePic:{
        type:String,
        default:""
    }
})

module.exports=mongoose.model('User',userSchema);