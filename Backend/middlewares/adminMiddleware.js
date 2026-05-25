const jwt=require('jsonwebtoken');
const User=require('../models/User');

const adminMiddleware=async (req,res,next)=>{
    try{
        const {token}=req.cookies;
        if(!token){
            return res.status(400).json({
                message:"Token is not present!"
            })
        }    
        const payload=jwt.verify(token,process.env.JWT_KEY);
        const {_id}=payload;
        if (!_id) throw new Error("ID is missing!");
        if(payload.role!="admin"){
            return res.status(400).json({
                message:"Access denied!"
            })
        }
        const result=await User.findById({_id});
        if(!result){
            return res.status(400).json({
                message:"admin not found!"
            })
        }
        req.result=result;
        next();
    }catch(err){
        res.status(500).json({
            message:err.message
        })
    }
}

module.exports=adminMiddleware;