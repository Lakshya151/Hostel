const Student = require('../models/Student');
const Room=require('../models/Room');
const Mess=require('../models/Mess');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const redisClient=require('../config/redis');
const User=require('../models/User');
const Complaint = require('../models/Complaint');
const validateAdmin=require('../middlewares/validateAdmin');
const validateStudent=require('../middlewares/validateStudent');


//register admin
const registerAdmin=async (req,res)=>{
    try{
        validateAdmin(req.body);
        const {username,email,password,phoneNumber,aadhar,profilePic}=req.body;
        const normalizedEmail=email.trim().toLowerCase();
         const isExist = await User.findOne({
            email:normalizedEmail
        });

        if (isExist) {
            return res.status(400).json({
                message: "Admin already exists!"
            });
        }
        if(profilePic && !validator.isURL(profilePic)){
            throw new Error("Invalid profile picture URL");
        }
        const hashedPassword=await bcrypt.hash(password,10);
        const user=await User.create({
            username,
            email:normalizedEmail,
            phoneNumber,
            password:hashedPassword,
            aadhar,
            profilePic,
            role:"admin"
        });
        const token=jwt.sign({_id:user._id,role:user.role},process.env.JWT_KEY); 
        const userToken=res.cookie('token',token,{httpOnly:true});//maxAge is expiry time
        res.status(201).json({
            message:"User Registered Successfully",
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                phoneNumber: user.phoneNumber,
                profilePic: user.profilePic
            }
        });
    }catch(err){
        res.status(500).json({
            message:err.message
        })
    }
}
//login admin
const loginAdmin = async (req, res) => {

    try {

        const { email, password } = req.body;

        // validation
        if (!email || !password) {
            return res.status(400).json({
                message: "Credentials missing!"
            });
        }

        // find admin
        const user = await User.findOne({
            email: email.trim().toLowerCase()
        });

        if (!user) {
            return res.status(404).json({
                message: "Admin not found!"
            });
        }

        if (user.role !== "admin") {
            return res.status(403).json({
                message: "Access denied! Not an admin."
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid credentials"
            });
        }

        // generate token
        const token = jwt.sign({
            _id: user._id,
            role: user.role,
        }, process.env.JWT_KEY);
        res.cookie('token', token, {
            httpOnly: true,
            secure:true,
            sameSite:"strict"
        });
        res.status(200).json({
            message: "Admin login successful",
            admin: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                phoneNumber: user.phoneNumber,
                profilePic:user.profilePic
            }

        });
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};
//register new Student
const registerStudent=async(req,res)=>{
    try{
        validateStudent(req.body);
        const {username,email,password,phoneNumber,aadhar,
            roomNo,course,year,guardianName,
            guardianPhone,feeDue,profilePic}=req.body;

        const normalizedEmail = email.trim().toLowerCase();
        const isRegister=await User.findOne({email:normalizedEmail});
        if(profilePic && !validator.isURL(profilePic)){
            throw new Error("Invalid profile picture URL");
        }
        if(isRegister){
            return res.status(200).json({
                message:"Student already register!"
            })
        }
        const room=await Room.findOne({roomNo});

        if (!room) {
            return res.status(404).json({
                message: "Room not found!"
            });
        }

        const occupied=room.student.length;
        if(occupied>=room.capacity){
            return res.status(400).json({
                message: "Room is already full!"
            });
        }
        const hashedPassword=await bcrypt.hash(password,10);

        const newUser=await User.create({username,email:normalizedEmail,password:hashedPassword,phoneNumber,aadhar,role:"student",profilePic});
        const newStudent=await Student.create({userId:newUser._id,roomNo,course,year,guardianName,guardianPhone,feeDue});

        room.student.push(newUser._id);
        await room.save();

        
        const token =jwt.sign({_id:newUser._id,role:newUser.role},process.env.JWT_KEY);
        res.cookie('token',token,{httpOnly: true});

        res.status(201).json({
            message:"Register Successfull!",
            user: {
                _id: newUser._id,
                username: newUser.username,
                email:normalizedEmail,
                role: newUser.role,
                phoneNumber: newUser.phoneNumber,
                profilePic
            },
            Student:newStudent,
            occupiedStudent: room.student.length,
            availableSeat: room.capacity - room.student.length
        })
    }catch(err){
        res.status(500).json({
            message:err.message
        })
    }
}
//login as student
const loginStudent=async (req,res)=>{
    try{
        const {password}=req.body;
        const email=req.body.email.trim().toLowerCase();
        if(!email || !password)throw new Error("Credential missing!");
        const user=await User.findOne({email});
        if(!user)throw new Error("user not found!");
        const ismatch=await bcrypt.compare(password,user.password);
        if(!ismatch)throw new Error("wrong password!");
        if(user.role !== "student"){
            throw new Error("Access denied!");
        }
        const reply={
            _id:user._id,
            username:user.username,
            email:user.email,
            role:user.role,
            phoneNumber:user.phoneNumber,
            profilePic:user.profilePic
        }
        const token=jwt.sign({
            _id:user._id,
            role:user.role
        },process.env.JWT_KEY)
        res.cookie('token',token,{httpOnly: true});
        res.status(200).json({
            user:reply,
            message:"login Successfull",
        })
    }catch(err){
        res.status(500).json({
            message:err.message
        })
    }
}
//logout
const logout=async(req,res)=>{
    try{
        const {token}=req.cookies;
        const payload = jwt.verify(
            token,
            process.env.JWT_KEY
        );
        await redisClient.set(`token:${token}`,'Blocked');
         res.clearCookie("token");
        res.status(200).json({
            message:"Logout Successfull",
            role:payload.role
        })
    }catch(err){
        res.status(500).json({
            message: err.message
        });
    }
}
//search Student
const searchStudent=async (req,res)=>{
    try{
        const {query}=req.query;
        const currentUser=req.result._id;

        if (!query || query.trim() === "") {
            return res.status(400).json({ message: "Search query is required!" });
        }

        const users = await User.find({
            $or: [
                { username: { $regex: query, $options: 'i' } },
                { phoneNumber: { $regex: query, $options: 'i' } }
            ],
            _id: { $ne: currentUser } // exclude self
        }).select('username phoneNumber email ');

        const finalUser=await Promise.all(// this will attach roomNo
            users.map(async(user)=>{
                const student=await Student.findOne({
                    userId:user._id
                }).select('roomNo')
                return {
                    _id:user._id,
                    username:user.username,
                    phoneNumber:user.phoneNumber,
                    email:user.email,
                    roomNo:student? student.roomNo :null
                }
            })
        )

        res.status(200).json({user:finalUser});
    }catch(err){
        res.status(500).json({
            message:err.message
        })
    }
}
//check seat
const isSpace=async (req,res)=>{
    try{
        const {roomNo}=req.params;
        if (!roomNo || roomNo.trim() === "") {
            return res.status(400).json({
                message: "Room number is required!"
            });
        }
        const room=await Room.findOne({roomNo});
        if(!room){
            return res.status(404).json({
                message:"room with this number doesn't exits!"
            })
        }
        const occupied=room.student.length;
        const availableSeat=room.capacity-occupied;
        if(availableSeat>0){
            return res.status(200).json({
                roomNo:roomNo,
                capacity:room.capacity,
                occupiedStudent:occupied,
                availableSeat,
                isAvailable:true,
                message:"Room available!"
            })
        }
        return res.status(400).json({
            roomNo:roomNo,
                capacity:room.capacity,
                occupiedStudent:occupied,
                availableSeat:0,
                isAvailable:false,
                message:"This room is already full"
        })
    }catch(err){
        res.status(500).json({
            message:err.message
        })
    }
}
//set menu
const createMenu=async (req,res)=>{
    try{
        const {day,breakfast,lunch,snacks,dinner,type}=req.body;
        if(!day ||!breakfast|| !lunch || !snacks || !dinner || !type)throw new Error("Some fields are missing!");
        const alreadyExist=await Mess.findOne({day,type});
        if(alreadyExist){
            return res.status(400).json({
                message:"Menu already exist for this day!"
            })
        }
        const messMenu=await Mess.create({
            day,breakfast,lunch,snacks,dinner,type
        })
        res.status(201).json({
            menu:messMenu,
            message:"menu for the day added successfully!"
        })
    }catch(err){
        res.status(500).json({
            message:err.message
        })
    }
}
//get all menu
const getMenu=async (req,res)=>{
    try{
        const menu=await Mess.find().sort({createdAt:-1});
        if(menu.length===0){
            return res.status(404).json({
                message:"menu will be available soon!"
            })
        }
        res.status(200).json({
            menu
        });
    }catch(err){
        res.status(500).json({
            message:err.message
        })
    }
}
//get menu by day
const getMenuByDay=async (req,res)=>{
    try{
        const {day}=req.params;
        if(!day){
            return res.status(400).json({
                message:"Please enter day!"
            })
        }

        const menu=await Mess.find({day});
        if(!menu){
            return res.status(404).json({
                message:"menu for this day is not available!"
            })
        }

        res.status(200).json({
            menu
        });
    }catch(err){
        res.status(500).json({
            message:err.message
        })
    }
}
//update mess menu
const updateMessMenu = async (req, res) => {

    try {

        const {day,type} = req.params;
        if(!day||!type){
            return res.status(400).json({
                message:"Please provide day and type!"
            })
        }
        const updatedMenu = await Mess.findOneAndUpdate(
            {day,type},        // find by day
            req.body,       // updated data
            { new: true }   // return updated document
        );

        if (!updatedMenu) {
            return res.status(404).json({
                message: "Menu not found"
            });
        }

        res.status(200).json({
            message: "Menu updated successfully",
            menu: updatedMenu
        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }
};
//delete menu
const deleteMenu=async (req,res)=>{
    try{
        const {day}=req.params;
        if(!day){
            return res.status(400).json({
                message:"Please enter day"
            })
        }

        const menu=await Mess.findOneAndDelete({day});

        if(!menu){
            return res.status(404).json({
                message:"Menu not found for this day!"
            })
        }

        res.status(200).json({
            message:"Menu deleted successfully!",
            menu:menu
        })

    }catch(err){
        res.status(500).json({
            message:err.message
        })
    }
}
//file complaint
const fileComplaint=async (req,res)=>{
    try{
        const{roomNo,title,description}=req.body;

        if(!roomNo ||!title){
            return res.status(400).json({
                message:"credentials missing!"
            })
        }

        const room = await Room.findOne({ roomNo });

        if (!room) {
            return res.status(404).json({
                message: "Room not found!"
            });
        }

        const isExist=await Complaint.findOne({roomNo,title,status:"pending"});
        if(isExist){
            return res.status(200).json({
                message:"complaint already exists !"
            })
        }

        const complaint=await Complaint.create({roomNo,title,description,userId: req.result._id});
        res.status(201).json({
            complaint,
            message:"complaint file successfully!"
        })
    }catch(err){
        res.status(500).json({
            message:err.message
        })
    }
}
//get my complaint
const myComplaints = async (req, res) => {

    try {

        const userId = req.result._id;

        const complaints =
            await Complaint.find({
                userId
            }).sort({ createdAt: -1 });

        if (complaints.length === 0) {

            return res.status(404).json({
                message:
                    "No complaints found!"
            });

        }

        res.status(200).json({
            complaints
        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }
};
//delete complaint
const deleteComplaint=async (req,res)=>{
    try{
        const userId=req.result._id;
        const {_id}=req.params;
        if(!_id){
            return res.status(400).json({
                message:"complaint Id is missing !"
            })
        }

        const complaint=await Complaint.findOneAndDelete({_id:_id,userId:userId});

        if(!complaint){
            return res.status(404).json({
                message:"complaint not found!"
            })
        }

        res.status(200).json({
            complaint,
            message:"Complaint deleted Successfully!"
        })
    }catch(err){
        res.status(500).json({
            message:err.message
        })
    }
}
//resolve complaint
const resolveComplaint=async (req,res)=>{
    try{
        const {_id}=req.params;//complaint id
        if(!_id){
            return res.status(400).json({
                message:"complaint Id missing!"
            })
        }
        const complaint=await Complaint.findById({_id});

        if(!complaint){
            return res.status(404).json({
                message:"complaint doesn't exist for this room"
            })
        }
        complaint.status="resolve";
        await complaint.save();

        res.status(200).json({
            complaint,
            message:"complaint resolved!"
        })

        
    }catch(err){
        res.status(500).json({
            message:err.message
        })
    }
}
//view all complaint
const viewComplaint=async (req,res)=>{
    try{
        const complaint=await Complaint.find().sort({createdAt:-1});
        if(complaint.length===0){
            return res.status(404).json({
                message:"No complant available!"
            })
        }
        res.status(200).json({
            complaint
        });
    }catch(err){
        res.status(500).json({
            message:err.message
        })
    }
}
//view complaint by roomNo
const viewRoomComplaint=async (req,res)=>{
    try{
        const {roomNo}=req.params;
        if(!roomNo){
            return res.status(404).json({
                message:"roomNo not found!"
            })
        }
        const complaint=await Complaint.find({roomNo});
        if(!complaint){
            return res.status(404).json({
                message:"no complaint found!"
            })
        }
        res.status(200).json({
            complaint
        })
    }catch(err){
        res.status(500).json({
            message:err.message
        })
    }
}
//get student profile
const studentProfile = async (req, res) => {

    try {

        const userId = req.result._id;

        const student =await Student.findOne({userId: userId})
        .populate('userId','username email phoneNumber role profilePic aadhar');

        if (!student) {
            return res.status(404).json({
                message: "Student not found!"
            });
        }

        res.status(200).json({
            username:student.userId.username,
            email: student.userId.email,
            phoneNumber:student.userId.phoneNumber,
            role:student.userId.role,
            profilePic:student.userId.profilePic,
            aadhar:student.userId.aadhar,
            roomNo:student.roomNo,
            course:student.course,
            year:student.year,
            guardianName:student.guardianName,
            guardianPhone:student.guardianPhone
        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }
};
//get admin profile
const adminProfile=async (req,res)=>{
    try{
        const _id=req.result._id;
        const admin = await User.findById(userId).select(
                'username email phoneNumber role aadhar profilePic'
        );
        res.status(200).json({
            username:admin.username,
            email:admin.email,
            phoneNumber:admin.phoneNumber,
            role:admin.role,
            profilePic:admin.profilePic
        })
    }catch(err){
        res.status(500).json({
            message:err.message
        })
    }
}
//update student profile
//clean room and bathroom
module.exports={registerAdmin,registerStudent,loginAdmin,loginStudent,searchStudent,
    isSpace,createMenu,getMenu,getMenuByDay,updateMessMenu,deleteMenu,fileComplaint,deleteComplaint,
    resolveComplaint,viewComplaint,viewRoomComplaint,logout,myComplaints,studentProfile,adminProfile
}