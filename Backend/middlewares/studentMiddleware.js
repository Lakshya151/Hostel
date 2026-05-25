const jwt=require('jsonwebtoken');
const User=require('../models/User');

const studentMiddleware=async (req,res,next)=>{
    try{
        const {token}=req.cookies;
        if(!token){
            return res.status(400).json({
                message:"tokens not present!"
            })
        }

        const payload=jwt.verify(token,process.env.JWT_KEY);
        const {_id}=payload;
        if(!_id)throw new Error("Id not present!");
        const result=await User.findById(_id);
        if(!result)throw new Error("Student isn't registered")
        req.result=result;
        next();
    }catch(err){
        res.status(500).json({
            message:err.message
        })
    }
}
module.exports=studentMiddleware;