const User=require("../models/User");
const Worker=require("../models/worker");

const workerMiddleware=async(req,res,next)=>{

    try{

        if(!req.result || !req.result._id){

            return res.status(401).json({
                message:"Unauthorized"
            });

        }

        const user=await User.findById(req.result._id);

        if(!user){

            return res.status(404).json({
                message:"User not found"
            });

        }

        if(user.role!=="worker"){

            return res.status(403).json({
                message:"Worker access required"
            });

        }

        const worker=await Worker.findOne({
            userId:user._id,
            workerType:"lunchbox",
            isActive:true
        });

        if(!worker){

            return res.status(403).json({
                message:"Worker is not active"
            });

        }

        req.worker=worker;

        next();

    }catch(error){

        console.log(error);

        return res.status(500).json({
            message:"Worker authorization failed"
        });

    }

};

module.exports=workerMiddleware;