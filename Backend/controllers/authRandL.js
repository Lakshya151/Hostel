const Student = require('../models/Student');
const Room=require('../models/Room');
const Mess=require('../models/Mess');
const User=require('../models/User');
const Fee = require('../models/Fee');
const KYCmodel = require('../models/KYC');
const Announcement=require('../models/Announcement');
const Outing = require("../models/Outing");
const mongoose=require('mongoose');
const Bus=require('../models/Bus');
const Complaint = require('../models/Complaint');
const sendMail=require('../utils/sendMail');
const jwt = require('jsonwebtoken');
const redisClient=require('../config/redis');
const validateAdmin=require('../middlewares/validateAdmin');
const validateStudent=require('../middlewares/validateStudent');
const validator = require("validator");
const validateBus = require('../utils/validateBus');



// otp generator
const generateOTP = () => {
    return Math.floor(
        100000 + Math.random() * 900000
    ).toString();
};
//verify otp login
const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                message: "Missing credentials!"
            });
        }

        const user = await User.findOne({email: email.trim().toLowerCase() });

        if (!user) {
            return res.status(404).json({
                message: "User not found!"
            });
        }

        if (user.emailOTP !== otp) {
            return res.status(400).json({
                message: "Invalid OTP!"
            });
        }

        if (user.otpExpiry < Date.now()) {
            return res.status(400).json({
                message: "OTP expired!"
            });
        }

        // CLEAR OTP
        user.emailOTP = null;
        user.mobileOTP = null;
        user.otpExpiry = Date.now() + 5 * 60 * 1000;

        await user.save();

        // LOGIN TOKEN
        const token = jwt.sign({_id: user._id,role: user.role},
            process.env.JWT_KEY,{expiresIn: "7d"}
        );
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
        });

        res.status(200).json({
            message: "Login successful",
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                phoneNumber: user.phoneNumber,
                profilePic: user.profilePic
            }
        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }
};
//resend otp
const resendOTP = async (req, res) => {

    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                message: "Email is required!"
            });
        }

        const normalizedEmail =email.trim().toLowerCase();

            
        const user = await User.findOne({ email: normalizedEmail});

        if (!user) {
            return res.status(404).json({
                message: "User not found!"
            });
        }

        // Prevent spam requests
        if (user.otpExpiry &&user.otpExpiry >Date.now()) {
            return res.status(400).json({
                message:
                    "Please wait before requesting another OTP"
            });
        }

        const otp = generateOTP();

        user.emailOTP = otp;
        //user.mobileOTP = otp;
        user.otpExpiry =Date.now() + 5 * 60 * 1000;    

        await user.save();
        await sendMail(
            user.email,
            "Hostel OTP",
            `
            <h2>Hostel Management System</h2>

            <p>Your OTP is:</p>

            <h1>${otp}</h1>

            <p>
                OTP valid for 5 minutes.
            </p>
            `
        );

        return res.status(200).json({
            message:
                "OTP resent successfully!"
        });

    } catch (err) {

        return res.status(500).json({
            message: err.message
        });

    }
};
// student dashboard
const studentDashboard = async (req, res) => {
    try {

        const userId = req.result._id;

        // student profile
        const student = await Student.findOne({userId})
        .populate(
            'userId',
            'username email phoneNumber profilePic address'
        );

        if (!student) {
            return res.status(404).json({
                message: "Student not found!"
            });
        }

        // complaints
        const complaints = await Complaint.find({ userId})
           .sort({ createdAt: -1 });

        const pendingComplaints =complaints.filter(
                complaint => complaint.status === "pending")
            .length;
            

        // fees
        const fees = await Fee.find({
            studentId: student._id
        });

        // today's mess menu
        const today = new Date().toLocaleString('en-US', {
            weekday: 'long'
        });
        
        const messMenu = await Mess.find({ day: today});

        res.status(200).json({

            profile: student,

            room: {roomNo: student.roomNo},

            complaints: {totalComplaints:
                    complaints.length,
                pendingComplaints
            },
                
            fees,

            messMenu

        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }
};
// admin dashboard
const adminDashboard = async (req, res) => {

    try {

        // students
        const totalStudents = await User.countDocuments({role: "student"});

        const activeStudents = await User.countDocuments({role: "student",isResident: true});

        const pastStudents = await User.countDocuments({role: "student",isResident: false});

        // rooms
        const totalRooms = await Room.countDocuments();

        const occupiedRooms = await Room.countDocuments({status: "full"});

        const availableRooms = await Room.countDocuments({status: "available"});

        // complaints
        const totalComplaints =await Complaint.countDocuments();
            
        const pendingComplaints =await Complaint.countDocuments({
                status: "pending"
        });
            

        const resolvedComplaints =await Complaint.countDocuments({
                status: "resolved"
        }); 

        // pending fees
        const pendingFees = await Fee.countDocuments({
            installments: {
                $elemMatch: {
                    status: "pending"
                }
            }
        });

        res.status(200).json({

            students: {
                totalStudents,
                activeStudents,
                pastStudents
            },
            rooms: {
                totalRooms,
                occupiedRooms,
                availableRooms
            },
            complaints: {
                totalComplaints,
                pendingComplaints,
                resolvedComplaints
            },
            fees: {
                pendingFees
            }

        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }
};
//register admin
const registerAdmin=async (req,res)=>{
    try{
        validateAdmin(req.body);
        const {username,email,phoneNumber,aadhar,profilePic,address}=req.body;
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
         // address validation
        if (!address ||!address.city ||!address.state || !address.pincode) {
            return res.status(400).json({
                message:
                    "Complete address is required!"
            });
        }

        // generate otp
        const otp = generateOTP();

        const user=await User.create({
            username,
            email:normalizedEmail,
            phoneNumber,
            aadhar,
            address,
            profilePic,
            role:"admin",
            emailOTP: otp,
            mobileOTP: otp,
            otpExpiry: Date.now() + 5 * 60 * 1000
        });

        //send register otp
        await sendMail(
            normalizedEmail,
            "Hostel Registration OTP",
            `
            <h2>Welcome to Hostel Management</h2>

            <p>Your OTP is:</p>

            <h1>${otp}</h1>

            <p>OTP valid for 5 minutes.</p>
            `
        );

        res.status(201).json({
            message:"User Registered Successfully",
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                phoneNumber: user.phoneNumber,
                profilePic: user.profilePic,
                address
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
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                message: "Email is required!"
            });
        }
    
        const normalizedEmail =email.trim().toLowerCase();
            

        const user = await User.findOne({
            email: normalizedEmail
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

        const otp = generateOTP();

        user.emailOTP = otp;
        user.mobileOTP = otp;

        // otp expiry -> 5 mins
        user.otpExpiry =
            Date.now() + 5 * 60 * 1000;

        await user.save();

        // ADDED: send otp email
        await sendMail(
            user.email,
            "Admin Login OTP",
            `
            <h2>Hostel Admin Login</h2>

            <p>Your OTP is:</p>

            <h1>${otp}</h1>

            <p>
                OTP valid for 5 minutes.
            </p>
            `
        );

        // OPTIONAL:
        // SEND MOBILE OTP HERE
        // using Twilio / Fast2SMS

        res.status(200).json({
            message:
                "OTP sent successfully to email and mobile"
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
        const {username,email,phoneNumber,aadhar,
            roomNo,course,year,guardianName,collegeName,
            guardianPhone,feeDue,profilePic,registrationFee,address}=req.body;

        const normalizedEmail = email.trim().toLowerCase();
        const isRegister=await User.findOne({email:normalizedEmail});
        if(profilePic && !validator.isURL(profilePic)){
            throw new Error("Invalid profile picture URL");
        }
        if(isRegister){
            return res.status(409).json({
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
         
         if(registrationFee === undefined || registrationFee <= 0){
            return res.status(400).json({
                message:"Valid registration fee required!"
            });
        }
        // address validation
        if (!address ||!address.city ||!address.state || !address.pincode) {
            return res.status(400).json({
                message:
                    "Complete address is required!"
            });
        }

        const otp=generateOTP();

        const newUser=await User.create({username,email:normalizedEmail,phoneNumber,aadhar,address,role:"student",profilePic,isResident:true
            ,emailOTP: otp,
            mobileOTP: otp,
            otpExpiry: Date.now() + 5 * 60 * 1000
        });
        
        // SEND REGISTRATION OTP
        await sendMail(
            normalizedEmail,
            "Hostel Registration OTP",
            `
            <h2>Welcome to Hostel Management</h2>

            <p>Your OTP is:</p>

            <h1>${otp}</h1>

            <p>
                OTP valid for 5 minutes.
            </p>
            `
        );

        const newStudent=await Student.create({userId:newUser._id,roomNo,course,collegeName,year,guardianName,guardianPhone,feeDue});
      
        const registrationFeeRecord=await Fee.create({studentId:newStudent._id,feeType:"registration",
            totalAmount:registrationFee,totalPaid:registrationFee,
            installments:[
                    {
                        amount:registrationFee,
                        status:"paid",
                        paidAt:new Date()
                    }
                ]
        });
        

        room.student.push(newUser._id);
        await room.save();

        
       

        res.status(201).json({
            message:"Register Successfull!",
            user: {
                _id: newUser._id,
                username: newUser.username,
                email:normalizedEmail,
                role: newUser.role,
                phoneNumber: newUser.phoneNumber,
                profilePic,
                address
            },
            Student:newStudent,
            occupiedStudent: room.student.length,
            availableSeat: room.capacity - room.student.length,
            registrationFee: registrationFeeRecord
        })
    }catch(err){
        res.status(500).json({
            message:err.message
        })
    }
}
//login as student
const loginStudent = async (req, res) => {

    try {
        const {email} = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Email required!"
            });
        }

        const normalizedEmail =email.trim().toLowerCase();
            
        const user = await User.findOne({email: normalizedEmail});

        if (!user) {
            return res.status(404).json({
                message: "User not found!"
            });
        }

        if (user.role !== "student") {
            return res.status(403).json({
                message: "Access denied!"
            });
        }
        if(!user.isResident){
            return res.status(403).json({
                message:"Access denied"
            })
        }
        // ADDED: generate otp
        const otp = generateOTP();

        user.emailOTP = otp;
        user.mobileOTP = otp;

        user.otpExpiry =Date.now() + 5 * 60 * 1000;
            

        await user.save();

        // SEND EMAIL OTP
        await sendMail(
            user.email,
            "Login OTP",
            `
            <h2>Hostel Login OTP</h2>

            <h1>${otp}</h1>

            <p>OTP valid for 5 minutes.</p>
            `
        );

        // MOBILE OTP
        // ADD FAST2SMS/TWILIO HERE

        res.status(200).json({
            message:
                "OTP sent to email and mobile"
        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }
};
//logout
const logout=async(req,res)=>{
    try{
        const token = req.cookies?.token;

        if(!token){
            return res.status(401).json({
                message:"No token found!"
            });
        }
        const payload = jwt.verify(
            token,
            process.env.JWT_KEY
        );
        await redisClient.set(`token:${token}`,"Blocked",
            {EX: 60 * 60 * 24 * 7}
        );
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
//delete student
const deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                message: "Student ID required!"
            });
        }

        // find student profile
        const student = await Student.findOne({
            userId: id
        });

        if (!student) {
            return res.status(404).json({
                message: "Student not found!"
            });
        }

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                message: "User not found!"
            });
        }

        // remove from room
        const room = await Room.findOne({roomNo: student.roomNo});

        if (room) {
            room.student = room.student.filter(
                studentId =>
                    studentId.toString() !== id
            );
            await room.save();
        }

        // mark as past resident
        user.isResident = false;

        await user.save();

        res.status(200).json({
            message:
                "Student removed from hostel successfully!"
        });

    }catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};
//get all present resident student
const allResidentStudents=async (req,res)=>{
    try{
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
         
        const residentStudentStats = await Student.aggregate([ //for pagination , to get the count of resident students
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $unwind: "$user"
            },
            {
                $match: {
                    "user.isResident": true,
                    "user.role": "student"
                }
            },
            {
                $count: "count"
            }
        ]);

        const totalStudents =residentStudentStats[0]?.count || 0;
        
        const students=await Student.find().populate({
            path:"userId",
            match:{
                isResident:true,
                role:"student"
            },select:"username email phoneNumber profilePic aadhar"
        }).sort({createdAt:-1})
        .skip(skip)
        .limit(limit);
        

        // remove null users
        const activeStudents = students.filter(
            student => student.userId !== null
        );

        if(activeStudents.length===0){
            return res.status(404).json({
                message:"No active student found"
            })
        }
        res.status(200).json({
            currentPage: page,
            totalPages:Math.ceil(totalStudents/ limit),
            totalStudents,
            studentsPerPage: limit,
            students: activeStudents
        })
    }catch(err){
        res.status(500).json({
            message:err.message
        })
    }
}
//get student using college name
const getStudentByCollege=async (req,res)=>{
    try{
        const {collegeName}=req.params;

        if(!collegeName){
            return res.status(400).json({
                message:"College  name is required"
            })
        }

        const page=parseInt(req.query.page)||1;
        const limit=parseInt(req.query.limit)||10;
        const skip=(page-1)*limit;

        const totalStudents =await Student.countDocuments({
            collegeName: {
                $regex: collegeName,
                $options: "i"
            }
        });
        const students = await Student.find({
                collegeName: {
                    $regex: collegeName,
                    $options: "i"
                }
        }).populate(
                "userId",
                "username email phoneNumber profilePic"
            ).sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        if (students.length === 0) {

            return res.status(404).json({
                message:
                    "No students found for this college!"
            });
        }

        const totalPages =Math.ceil(totalStudents / limit);

        if(page > totalPages && students > 0){
            return res.status(400).json({
                message: "Page does not exist"
            });
        }    

        return res.status(200).json({

            collegeName,

            totalStudents,

            totalPages,

            currentPage: page,

            hasNextPage: page < totalPages,

            hasPrevPage: page > 1,

            students

        });
    }catch(err){
        res.status(500).json({
            message:err.message
        })
    }
            
}
//get past students
const pastStudents=async (req,res)=>{
    try{
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
         
        const nonResidentStudent = await Student.aggregate([ //for pagination , to get the count of non resident students
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $unwind: "$user"
            },
            {
                $match: {
                    "user.isResident": false,
                    "user.role": "student"
                }
            },
            {
                $count: "count"
            }
        ]);

        const totalStudents =nonResidentStudent[0]?.count || 0;
        const students=await Student.find().populate({
            path:"userId",
            match:{
                isResident:false,
                role:"student"
            },select:"username email phoneNumber profilePic aadhar"
        }).sort({createdAt:-1})
        .skip(skip)
        .limit(limit)
        

        // remove null users
        const pastStudents = students.filter(
            student => student.userId !== null
        );

        if(pastStudents.length===0){
            return res.status(404).json({
                message:"No past student found"
            })
        }

        res.status(200).json({
            currentPage: page,
            totalPages:Math.ceil(totalStudents/ limit),
            totalStudents,
            studentsPerPage: limit,
            students:pastStudents
        })
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

        if(!day || !type){
            return res.status(400).json({
                message:"day and food-type is required"
            })
        }
        if(
            !Array.isArray(breakfast) ||
            !Array.isArray(lunch) ||
            !Array.isArray(snacks) ||
            !Array.isArray(dinner)
        ){
            return res.status(400).json({
                message:"Credential missing"
            })
        }
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
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
         
        const totalMenus = await Mess.countDocuments();
        const menu=await Mess.find().sort({createdAt:-1})
        .skip(skip).limit(limit)
        
        if(menu.length===0){
            return res.status(404).json({
                message:"menu will be available soon!"
            })
        }
        const totalPages=Math.ceil(totalMenus / limit);

        if(page > totalPages && totalMenus > 0){
            return res.status(400).json({
                message: "Page does not exist"
            });
        }
        res.status(200).json({
            totalMenus,
            totalPages,
            currentPage: page,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
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
        let {day}=req.params;
        if(!day){
            return res.status(400).json({
                message:"Please enter day!"
            })
        }

        day =day.charAt(0).toUpperCase() +day.slice(1).toLowerCase();
            
        const menu=await Mess.find({day}).sort({createdAt:-1});
        if(menu.length===0){
            return res.status(404).json({
                message:`menu for ${day} is not available!`
            })
        }

        res.status(200).json({
            totalMenu:menu.length,
            day,
            menu
        });
    }catch(err){
        res.status(500).json({
            message:err.message
        })
    }
}
//get today menu
const todayMenu=async (req,res)=>{
    try{
        const today = new Date().toLocaleDateString(
            "en-US",
            { weekday: "long" }
        );
        const menu=await Mess.find({day:today});
        if(menu.length===0){
            return res.status(404).json({
                message:`menu not available for ${today}`
            })
        }

        res.status(200).json({
            day:today,
            totalMenu:menu.length,
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
            {day,type},  
            req.body,   
            { new: true ,runValidators:true} 
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
//update complaint-> runValidator (check)
const updateComplaint = async (req, res) => {

    try {
        const complaintId = req.params._id;
        const userId = req.result._id;

        if (!complaintId) {
            return res.status(400).json({
                message: "Complaint id is missing!"
            });
        }

        const { title, description } = req.body;
        const allowUpdate = {};

        if (title && title.trim() !== "") {
            allowUpdate.title = title.trim();
        }

        if (description && description.trim() !== "") {
            allowUpdate.description =description.trim();
        }

        // no fields provided
        if (Object.keys(allowUpdate).length === 0) {
            return res.status(400).json({
                message:
                    "No valid fields provided for update!"
            });
        }
        // find complaint
        const complaint =await Complaint.findOne({
            _id: complaintId,
            userId
        });
            
        if (!complaint) {
            return res.status(404).json({
                message:"Complaint not found!"
            });    
        }

        // prevent update after resolved
        if (complaint.status === "resolved") {
            return res.status(400).json({
                message:
                    "Resolved complaint cannot be updated!"
            });
        }

        // update fields
        Object.assign(complaint,allowUpdate);

        await complaint.save();

        return res.status(200).json({

            message:
                "Complaint updated successfully",

            complaint

        });

    } catch (err) {

        return res.status(500).json({
            message: err.message
        });

    }
};
//get my complaint
const myComplaints = async (req, res) => {

    try {

        const userId = req.result._id;

        if(!userId){
            return res.status(404).json({
                message:"User Id not found"
            })
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const totalComplaints=await Complaint.countDocuments({userId});
        const complaints =
            await Complaint.find({
                userId
            }) .sort({ createdAt: -1 })
            .skip(skip).limit(limit)
           

        if (complaints.length === 0) {

            return res.status(404).json({
                message:
                    "No complaints found!"
            });

        }
        const totalPages=Math.ceil(totalComplaints/limit);

        if(page > totalPages && totalComplaints> 0){
            return res.status(400).json({
                message: "Page does not exist"
            });
        }

        res.status(200).json({
            totalComplaints,
            totalPages,
            currentPage: page,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
            complaints
        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }
};
//delete complaint(user)
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
//resolve complaint (user)
const resolveComplaint = async (req, res) => {
    try {
        const { _id } = req.params;
        if (!_id) {
            return res.status(400).json({
                message: "Complaint id is required"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(_id)) {
            return res.status(400).json({
                message: "Invalid complaint id"
            });
        }

        const complaint = await Complaint.findById(_id);

        if (!complaint) {
            return res.status(404).json({
                message: "Complaint not found"
            });
        }

        const user = req.result;

        if (
            user.role !== "admin" &&
            complaint.userId.toString() !== user._id.toString()
        ) {
            return res.status(403).json({
                message: "Not authorized"
            });
        }

        if (complaint.status === "resolved") {
            return res.status(400).json({
                message: "Complaint already resolved"
            });
        }

        complaint.status = "resolved";

        await complaint.save();

        res.status(200).json({
            message: "Complaint resolved successfully",
            complaint
        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }
};
//view all complaint(Admin)
const viewComplaint=async (req,res)=>{
    try{
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const totalComplaints=await Complaint.countDocuments();
        const complaints=await Complaint.find().sort({createdAt:-1})
        .skip(skip).limit(limit)
        
        if(complaints.length===0){
            return res.status(404).json({
                message:"No complant available!"
            })
        }
        
        const totalPages=Math.ceil(totalComplaints/limit);

        if(page > totalPages && totalComplaints > 0){
            return res.status(400).json({
                message: "Page does not exist"
            });
        }

        res.status(200).json({
            totalPages,
            totalComplaints,
            currentPage: page,

            hasNextPage: page < totalPages,

            hasPrevPage: page > 1,

            complaints
        });
    }catch(err){
        res.status(500).json({
            message:err.message
        })
    }
}
//view complaint by roomNo(admin)
const viewRoomComplaint=async (req,res)=>{
    try{
        const {roomNo}=req.params;
        if(!roomNo){
            return res.status(404).json({
                message:"roomNo not found!"
            })
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const totalComplaints=await Complaint.countDocuments({roomNo});
        const complaints=await Complaint.find({roomNo}).sort({createdAt:-1})
        .skip(skip).limit(limit)
        
        if(complaints.length===0){
            return res.status(404).json({
                message:"no complaint found!"
            })
        }

        const totalPages=Math.ceil(totalComplaints/limit);

        if(page > totalPages && totalComplaints > 0){
            return res.status(400).json({
                message: "Page does not exist"
            });
        }

        res.status(200).json({
            totalPages,

            currentPage: page,

            hasNextPage: page < totalPages,

            hasPrevPage: page > 1,

            complaints
        })
    }catch(err){
        res.status(500).json({
            message:err.message
        })
    }
}
//view complaint by status(admin)
const viewComplaintByStatus = async (req, res) => {

    try {

        const page =parseInt(req.query.page) || 1;
            
        const limit =parseInt(req.query.limit) || 10;

        const skip = (page - 1) * limit;

        // total complaints
        const totalComplaints =await Complaint.countDocuments();

        const complaints = await Complaint.aggregate([

            {
                $addFields: {
                    statusOrder: {
                        $switch: {
                            branches: [
                                {
                                    case: {
                                        $eq: [
                                            "$status",
                                            "pending"
                                        ]
                                    },
                                    then: 1
                                },
                                {
                                    case: {
                                        $eq: [
                                            "$status",
                                            "in-progress"
                                        ]
                                    },
                                    then: 2
                                },
                                {
                                    case: {
                                        $eq: [
                                            "$status",
                                            "resolved"
                                        ]
                                    },
                                    then: 3
                                }
                            ],
                            default: 4
                        }
                    }
                }
            },

            {
                $sort: {
                    statusOrder: 1,
                    createdAt: -1
                }
            },

            {
                $skip: skip
            },

            {
                $limit: limit
            }

        ]);

        if (complaints.length === 0) {

            return res.status(404).json({
                message: "No complaints available!"
            });
        }

        const totalPages =Math.ceil(totalComplaints / limit);

        if(page > totalPages && totalComplaints > 0){
            return res.status(400).json({
                message: "Page does not exist"
            });
        }

        return res.status(200).json({

            totalComplaints,

            totalPages,

            currentPage: page,

            hasNextPage: page < totalPages,

            hasPrevPage: page > 1,

            complaints

        });

    } catch (err) {

        return res.status(500).json({
            message: err.message
        });

    }
};
//count complaints (admin)
const complaintStats = async (req, res) => {
    try {

        const totalComplaints = await Complaint.countDocuments();

        const pending = await Complaint.countDocuments({
            status: "pending"
        });

        const inProgress = await Complaint.countDocuments({
            status: "in-progress"
        });

        const resolved = await Complaint.countDocuments({
            status: "resolved"
        });

        res.status(200).json({
            totalComplaints,
            pending,
            inProgress,
            resolved
        });

    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};
//get student profile
const studentProfile = async (req, res) => {

    try {

        const userId = req.result._id;

        const student =await Student.findOne({userId: userId})
        .populate('userId','username email phoneNumber role profilePic aadhar address');

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
            collegeName:student.collegeName,
            year:student.year,
            guardianName:student.guardianName,
            guardianPhone:student.guardianPhone,
            address:student.userId.address
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
        const userId=req.result._id;
        
        if(!userId){
            return res.status(404).json({
                message:"user Id not found"
            })
        }
        const admin = await User.findById(userId).select(
                'username email phoneNumber role aadhar profilePic address'
        );
        if(!admin){
            return res.status(404).json({
                message:"Admin not found"
            });
        }
        res.status(200).json({
            username:admin.username,
            email:admin.email,
            phoneNumber:admin.phoneNumber,
            role:admin.role,
            profilePic:admin.profilePic,
            address:admin.address
        })
    }catch(err){
        res.status(500).json({
            message:err.message
        })
    }
}
//update  profile 
const updateMyProfile = async (req, res) => {

    try {

        const userId = req.result._id;

        const {
            username,email,phoneNumber,profilePic,aadhar} = req.body;

        // find user first
        const user = await User.findById(userId);

        if (!user) {

            return res.status(404).json({
                message: "User not found!"
            });
        }

        const updateData = {};

        if (username) {
            updateData.username =username.trim();
        }

        if (email) {
            updateData.email =email.trim().toLowerCase();
        }

        if (phoneNumber) {
            updateData.phoneNumber =phoneNumber;
        }

        // profile picture cooldown
        if (profilePic) {

            if (!validator.isURL(profilePic)) {
                return res.status(400).json({
                    message:
                        "Invalid profile picture URL"
                });
            }

            const now = new Date();

            const lastUpdate =user.lastProfileUpdate;

            // 7 day cooldown
            if (lastUpdate && now - lastUpdate <7 * 24 * 60 * 60 * 1000) {
                return res.status(400).json({
                    message:
                        "Profile picture can only be updated once every 7 days"
                });
            }

            updateData.profilePic =profilePic;

            updateData.lastProfileUpdate =now;
        }

        if (aadhar) {
            if (!validator.isNumeric(aadhar)) {
                return res.status(400).json({
                    message:"Invalid Aadhaar number!"
                });
            }

            if (aadhar.length !== 12) {
                return res.status(400).json({
                    message:
                        "Aadhaar must be 12 digits!"
                });
            }

            const existingAadhar =await User.findOne({
                    aadhar,
                    _id: { $ne: userId }
                });
                

            if (existingAadhar) {
                return res.status(409).json({
                    message:"Aadhaar already exists!"
                });
            }
            updateData.aadhar = aadhar;
        }
        const existingEmail = await User.findOne({
            email: updateData.email,
            _id: { $ne: userId }
        });
        
        if(existingEmail){
            return res.status(409).json({
                message:"Email already exists"
            })
        }
        const updatedUser =
            await User.findByIdAndUpdate(
                userId,
                updateData,
                {
                    new: true,
                    runValidators: true
                }
            ).select("username email phoneNumber profilePic aadhar");
        return res.status(200).json({
            message:
                "Profile updated successfully!",

            user: updatedUser
        });
    } catch (err) {

        return res.status(500).json({
            message: err.message
        });
    }
};
//update Profile as admin
const updateProfileByAdmin=async (req,res)=>{
    try{
        const {id}=req.params;
        const {username,email,phoneNumber,aadhar,address,
            course,collegeName,year,guardianName,guardianPhone}=req.body;

        const updateUserData = {};
        const updateStudentData = {};
        
        if(username){
            updateUserData.username =username.trim();
        }
        if (email) {
            updateUserData.email = email.trim().toLowerCase();

            const existingEmail = await User.findOne({
                email: updateUserData.email,
                _id: { $ne: id }
            });

            if (existingEmail) {
                return res.status(409).json({
                    message: "Email already exists"
                });
            }
        }
        if(phoneNumber){
            updateUserData.phoneNumber=phoneNumber
        }
        if (aadhar) {
            const aadhaarRegex =/^[0-9]{12}$/;
            if (!aadhaarRegex.test(aadhar)) {
                return res.status(400).json({
                    message:
                        "Invalid Aadhaar number!"
                });
            }
            const existingAadhar =await User.findOne({
                    aadhar,
                    _id: { $ne: id }
            });
            if (existingAadhar) {
                return res.status(409).json({
                    message:"Aadhaar already exists!"   
                });
            }
            updateUserData.aadhar =aadhar;
        }
        if (course) updateStudentData.course = course;
        if(collegeName)updateStudentData.collegeName=collegeName;
        if (year) updateStudentData.year = year;
        if (guardianName) updateStudentData.guardianName =guardianName;
        if (guardianPhone)updateStudentData.guardianPhone=guardianPhone;
         // address validation
        if(address){
            if (!address ||!address.city ||!address.state || !address.pincode) {
                return res.status(400).json({
                    message:
                        "Complete address is required!"
                });
            }
            updateUserData.address=address;
        }
        

        const updatedUser=await User.findOneAndUpdate({_id:id},updateUserData,{new:true}).select(
            'username email phoneNumber aadhar'
        )
        if(!updatedUser){
            return res.status(404).json({
                message:"User not found!"
            })
        }

        const updatedStudent =await Student.findOneAndUpdate(
                { userId: id },updateStudentData,{ new: true }
            );
        if(!updatedStudent){
            return res.status(404).json({
                message:"User not found!"
            })
        }
        res.status(200).json({
            message:"Profile updated successfully!",
            user:updatedUser,
            student: updatedStudent
        })
    }catch(err){
        res.status(500).json({
            message:err.message
        })
    }
}
//create fee sturcture (installments)(admin)
const createFeeStructure = async (req, res) => {

    try {
        const createdBy = req.result._id;
        const {studentId,feeType,totalAmount,installments} = req.body;
        
        if (!studentId || !feeType ||!totalAmount ||!installments) {
            return res.status(400).json({
                message: "All fields are required!"
            });
        }

        // check student exists
        const student = await Student.findById(studentId);

        if (!student) {
            return res.status(404).json({
                message: "Student not found!"
            });
        }
        const alreadyExist = await Fee.findOne({studentId, feeType});

        if(alreadyExist){
            return res.status(409).json({
                message:"Fee structure already exists!"
            });
        }
        // installments validation
        if (!Array.isArray(installments) ||installments.length === 0){
            return res.status(400).json({
                message: "Installments are required!"
            });
        }

        // calculate installment total
        const invalidInstallment = installments.some(item => !item.amount || item.amount <= 0);

        if(invalidInstallment){
            return res.status(400).json({
                message:"Invalid installment amount!"
            });
        }
        const installmentTotal = installments.reduce(
            (sum, item) => sum + item.amount, 0
        );
        // check total amount match
        if (installmentTotal !== totalAmount) {
            return res.status(400).json({
                message:
                    "Installment total must equal totalAmount"
            });
        }

        // create fee structure
        const fee = await Fee.create({studentId,createdBy,feeType,totalAmount,totalPaid:0,installments});

        res.status(201).json({

            message:"Fee structure created successfully!",
            fee
        });

    } catch (err) {
        res.status(500).json({
            message: err.message
        });

    }
};
//get my fee
const getMyFees = async (req, res) => {

    try {
        const userId = req.result._id;
        // find student
        const student = await Student.findOne({ userId});

        if(!student){
            return res.status(404).json({
                message:"Student not found!"
            });
        }

        // get fees
        const fees = await Fee.find({ studentId: student._id  })
        .sort({ createdAt:-1 });

        if(fees.length === 0){
            return res.status(404).json({
                message:"No fees found!"
            });
        }

        res.status(200).json({
            fees
        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }
};
//get students with pendig fee (admin)
const getPendingFees = async (req, res) => {

    try {

        const page =parseInt(req.query.page) || 1;
        const limit =parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const totalPendingFees =await Fee.countDocuments({
            installments: {
                    $elemMatch: {
                        status: "pending"
                    }
                } 
            });

        const pendingFees = await Fee.find({
            installments: {
                $elemMatch: {status: "pending"}
            }
        })
        .populate({
            path: "studentId",
            populate: {
                path: "userId",
                select:
                    "username email phoneNumber"
            }
        }).sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        

        if (pendingFees.length === 0) {

            return res.status(404).json({
                message: "No pending fees!"
            });
        }

        const totalPages =Math.ceil(totalPendingFees / limit);
        if(page > totalPages && totalPendingFees > 0){
            return res.status(400).json({
                message: "Page does not exist"
            });
        }

        return res.status(200).json({

            totalPendingFees,

            totalPages,

            currentPage: page,

            hasNextPage: page < totalPages,

            hasPrevPage: page > 1,

            pendingFees

        });

    } catch (err) {

        return res.status(500).json({
            message: err.message
        });

    }
};
//pay installment
const payFee = async (req, res) => {

    try {
        const { feeId, installmentId } = req.params;
        const fee = await Fee.findById(feeId);

        if(!fee){
            return res.status(404).json({
                message:"Fee structure not found!"
            });
        }
        // fee already fully paid
        if (fee.totalPaid >= fee.totalAmount) {
            return res.status(400).json({
                message: "Fee already fully paid!"
            });
        }
        const student = await Student.findOne({
            userId: req.result._id
        });
        
        if(!student){
            return res.status(404).json({
                message:"Student not found!"
            })
        }
        if(fee.studentId.toString() !== student._id.toString()){
            return res.status(403).json({
                message:"Unauthorized access!"
            });
        }
        // find installment
        const installment = fee.installments.id(installmentId);

        if(!installment){
            return res.status(404).json({
                message:"Installment not found!"
            });
        }

        // already paid
        if(installment.status === "paid"){
            return res.status(400).json({
                message:"Installment already paid!"
            });
        }

        // update installment
        installment.status = "paid";
        installment.paidAt = new Date();
        fee.totalPaid += installment.amount;
        await fee.save();

        res.status(200).json({

            message:"Installment paid successfully!",

            fee

        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }
};
//cleaning room and bathroom

//create room(admin)
const createRoom=async (req,res)=>{
    try{
        const adminId=req.result._id;
        if(!adminId){
            return res.status(400).json({
                message:"admin Id not found"
            })
        }
        const {roomNo,floor,capacity, type,isAC}=req.body;
        if(!roomNo ||!capacity){
            return res.status(400).json({
                message:"Room number and capacity is required!"
            })
        }

        const alreadyExist=await Room.findOne({roomNo});
        if(alreadyExist){
            return res.status(409).json({
                message:"This room is already defined!"
            })
        }

        const room=await Room.create({roomNo,floor,capacity,
            type,isAC,student:[]
        })

        res.status(200).json({
            message:"Room created Successfully!",
            room
        })
    }catch(err){
    console.error(err);

    res.status(500).json({
        message: err.message,
        stack: err.stack
    });
}
}
//update room(admin)
const updateRoom=async (req,res)=>{
    try{
        const {roomNo}=req.params;
        
        if(!roomNo){
            return res.status(400).json({
                message:"roomNO is missing!"
            })
        }
        const {capacity,floor,type,isAC}=req.body;

        const room=await Room.findOne({roomNo});

        if(!room){
            return res.status(404).json({
                message:"No room exist with this roomNo!"
            })
        }
        if(capacity){
            if(capacity<room.student.length){
                return res.status(400).json({
                    message:"capacity can't be less than occupied student!"
                })
            }
            room.capacity=capacity;
        }
        if(floor){
            room.floor=floor;
        }
        if(type){
            room.type=type;
        }
        if(isAC!==undefined){
            room.isAC=isAC;
        }
       await room.save();
        res.status(200).json({
            message:"info updated successfully!",
            room
        })
    }catch(err){
        res.status(500).json({
            message:err.message
        })
    }
}
//get all rooms(admin)
const getAllRooms=async (req,res)=>{
    try{
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const totalRooms=await Room.countDocuments();
        const rooms=await Room.find().sort({createdAt:-1})
        .skip(skip).limit(limit)
        
        if(rooms.length===0){
            return res.status(404).json({
                message:"no room found!"
            })
        }
        const totalPages=Math.ceil(totalRooms/limit);

        if(page > totalPages && totalRooms > 0){
            return res.status(400).json({
                message: "Page does not exist"
            });
        }
        res.status(200).json({
            totalRooms,
            totalPages,

            currentPage: page,

            hasNextPage: page < totalPages,

            hasPrevPage: page > 1,

            rooms
        })
    }catch(err){
        res.status(500).json({
            message:err.message
        })
    }
}
//get room by number(admin)
const getRoomByNumber=async (req,res)=>{
    try{
        const {roomNo}=req.params;
        if(!roomNo){
            return res.status(400).json({
                message:"room number is not provided!"
            })
        }
        const room = await Room.findOne({roomNo})
        .populate({
            path:"student",
            select:"username email phoneNumber address"
        });
        if(!room){
            return res.status(404).json({
                message:"No room found with this room number!"
            })
        }
        res.status(200).json({
            room
        })
    }catch(err){
        res.status(500).json({
            message:err.message
        })
    }
}
//delete room(admin)
const deleteRoom=async (req,res)=>{
    try{
        const {roomNo}=req.params;
        if(!roomNo){
            return res.status(404).json({
                message:"room Number isn't provided!"
            })
        }
        const room = await Room.findOne({ roomNo });

        if (!room) {
            return res.status(404).json({
                message:"Room not found!"
            });
        }
        if(room.student.length>0){
            return res.status(400).json({
                message:"occupied room can't be deleted!"
            })
        }
        await Room.findOneAndDelete({roomNo});

        res.status(200).json({
            message:"Room deleted Successfully!"
        })
    }catch(err){
        res.status(500).json({
            message:err.message
        })
    }
}
// shift student room(admin)
const shiftStudentRoom = async (req, res) => {

    try {

        const { studentId } = req.params;
        const { newRoomNo } = req.body;

        if (!newRoomNo) {
            return res.status(400).json({
                message: "New room number required!"
            });
        }

        const student = await Student.findById(studentId);

        if (!student) {
            return res.status(404).json({
                message: "Student not found!"
            });
        }

        // old room
        const oldRoom = await Room.findOne({roomNo: student.roomNo});
        if(!oldRoom){
            return res.status(404).json({
                message:"Current room not found"
            });
        }

        const newRoom = await Room.findOne({roomNo: newRoomNo});

        if (!newRoom) {
            return res.status(404).json({
                message: "New room not found!"
            });
        }

        // check capacity
        if (
            newRoom.student.length >= newRoom.capacity
        ) {
            return res.status(400).json({
                message: "New room is full!"
            });
        }

        // remove from old room
        oldRoom.student =
            oldRoom.student.filter(
                id => id.toString() !==
                student.userId.toString()
            );

        // add to new room
        newRoom.student.push(student.userId);

        // update student room
        student.roomNo = newRoomNo;

        await oldRoom.save();
        await newRoom.save();
        await student.save();

        res.status(200).json({
            message:
                "Student room shifted successfully!",
            oldRoom: oldRoom.roomNo,
            newRoom: newRoom.roomNo
        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }
};
//search Student
const searchStudent = async (req, res) => {
    try {
        const { query } = req.query;
        const currentUser = req.result._id;

        if (!query || query.trim() === "") {
            return res.status(400).json({
                message: "Search query is required!"
            });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        if (page < 1 || limit < 1) {
            return res.status(400).json({
                message: "Invalid page or limit"
            });
        }

        const skip = (page - 1) * limit;

        const students = await Student.find()
            .populate({
                path: "userId",
                match: {
                    role: "student",
                    isResident: true,
                    _id: { $ne: currentUser },
                    $or: [
                        {
                            username: {
                                $regex: query,
                                $options: "i"
                            }
                        },
                        {
                            phoneNumber: {
                                $regex: query,
                                $options: "i"
                            }
                        },
                        {
                            email: {
                                $regex: query,
                                $options: "i"
                            }
                        }
                    ]
                },
                select:
                    "username phoneNumber email"
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const finalUsers = students
            .filter(student => student.userId)
            .map(student => ({
                _id: student.userId._id,
                username:student.userId.username,
                phoneNumber:student.userId.phoneNumber,
                email:student.userId.email,
                roomNo: student.roomNo
            }));

        if (finalUsers.length === 0) {
            return res.status(404).json({
                message: "No student found!"
            });
        }

        const totalStudents =await User.countDocuments({
                role: "student",
                isResident: true,
                _id: { $ne: currentUser },
                $or: [
                    {
                        username: {$regex: query,$options: "i"}
                    },
                    { phoneNumber: {
                            $regex: query,
                            $options: "i"
                        } 
                    },
                    { email: {
                            $regex: query,
                            $options: "i"
                        }
                        
                    }
                ]
            });
        const totalPages =Math.ceil(totalStudents / limit);
            
        res.status(200).json({
                    totalStudents,
                    totalPages,
                    currentPage: page,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1,
                    users: finalUsers
                });
        

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }
};
const applyLeave = async (req, res) => {

    try {
        const userId = req.result._id;

        const {category,customReason,expectedReturnTime} = req.body;
        if(!category){
            return res.status(400).json({
                message:"select of the reason"
            })
        }

        const student =await Student.findOne({userId});
            
        if (!student) {
            return res.status(404).json({
                message:
                    "Student not found!"
            });
        }

        const outing =await Outing.create({

                studentId:student._id,
                    
                category,

                customReason,

                expectedReturnTime
            });
            

        res.status(201).json({

            message:"Outing informed successfully",
            outing
        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }
};
// return from leave
const returnToHostel =async (req, res) => {
    try {

        const { outingId } =req.params;

        const outing =await Outing.findById(outingId);
            
        if (!outing) {
            return res.status(404).json({
                message:
                    "Outing not found!"
            });
        }

        outing.status = "returned";
           
        await outing.save();

        res.status(200).json({
            message: "Welcome back!",
            outing
        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }
};
//number of students on leave
const studentsOnLeave = async (req, res) => {

    try {

        const page =parseInt(req.query.page) || 1;
        const limit =parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // total students on leave
        const totalStudentsOnLeave =await Outing.countDocuments({status:"out"});
            
        const students = await Outing.find({status: "out"})
            .populate({
                path: "studentId",
                populate: {
                    path: "userId",
                    select:"username email phoneNumber"
                }
            })
            .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
        

        if (students.length === 0) {

            return res.status(404).json({
                message: "No student is on leave"
            });
        }

        const totalPages =Math.ceil( totalStudentsOnLeave / limit);

        if(page > totalPages && totalStudentsOnLeave > 0){
            return res.status(400).json({
                message: "Page does not exist"
            });
        }
        return res.status(200).json({

            totalStudentsOnLeave,

            totalPages,

            currentPage: page,

            hasNextPage: page < totalPages,

            hasPrevPage: page > 1,

            students

        });

    } catch (err) {

        return res.status(500).json({
            message: err.message
        });

    }
};

// bus schedule

//create bus schedule
const createBus=async (req,res)=>{
    try{
        const adminId=req.result._id;
        if(!adminId){
            return res.status(401).json({
               message:"admin Id not found"
            })
        }

        const {busNo,route,hostelToCollege,collegeToHostel}=req.body;
        validateBus(req.body);
        const normalizedBusNo=busNo.trim().toUpperCase();
        const normalizeRoute=route.trim();
        const existingBus = await Bus.findOne({ busNo :normalizedBusNo});

        if (existingBus) {
            return res.status(409).json({
                message: "Bus already exists!"
            });
        }
        const bus=await Bus.create({busNo:normalizedBusNo,route:normalizeRoute,hostelToCollege,collegeToHostel});
        res.status(201).json({
            message:"Bus schedule created successfully",
            bus
        })
        
    }catch(err){
        res.status(500).json({
            message:err.message
        })
    }
}
//update bus schedule

const updateBus = async (req, res) => {
    try {

        const adminId = req.result._id;
        if (!adminId) {
            return res.status(401).json({
                message: "Admin id is missing"
            });
        }

        const {busId} = req.params;

        if (!busId) {
            return res.status(400).json({
                message: "Bus id is required"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(busId)) {
            return res.status(400).json({
                message: "Invalid bus id"
            });
        }

        const {busNo, route,hostelToCollege,collegeToHostel}=req.body;

        const updateData = {};

        if (busNo) updateData.busNo =busNo.trim().toUpperCase();
        
        if (route) updateData.route = route.trim();
            
        if (hostelToCollege) updateData.hostelToCollege =hostelToCollege;            
    
        if (collegeToHostel) updateData.collegeToHostel =collegeToHostel;

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                message:
                    "No fields provided for update"
            });
        }

        if (updateData.busNo) {
            const existingBus =await Bus.findOne({
                    busNo: updateData.busNo,
                    _id: { $ne: busId }
                });
                
            if (existingBus) {
                return res.status(409).json({
                    message:
                        "Bus number already exists"
                });
            }
        }
        const updatedBus = await Bus.findByIdAndUpdate(busId,updateData,
                {new: true,runValidators: true}
            );
           

        if (!updatedBus) {
            return res.status(404).json({
                message: "Bus not found"
            });
        }
        res.status(200).json({
            message:
                "Bus schedule updated successfully",
            bus: updatedBus
        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }
}

//view Bus Schedule
const viewBus=async (req,res)=>{
    try{
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const totalBuses=await Bus.countDocuments();
        const busSchedule=await Bus.find().sort({createdAt:-1})
        .skip(skip).limit(limit);
        
        if(busSchedule.length===0){
            return res.status(404).json({
                message:"Bus schdule not found"
            })
        }
        
        const totalPages=Math.ceil(totalBuses/limit);

        if(page > totalPages && totalBuses > 0){
            return res.status(400).json({
                message: "Page does not exist"
            });
        }

        res.status(200).json({
            totalBuses,
            totalPages,

            currentPage: page,

            hasNextPage: page < totalPages,

            hasPrevPage: page > 1,

            busSchedule
        })
    }catch(err){
        res.status(500).json({
            message:err.message
        })
    }
}
//delete bus
const deleteBus=async (req,res)=>{
    try{
        const adminId = req.result._id;

        if (!adminId) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }
        const {busId}=req.params;
        if(!busId){
            return res.status(400).json({
                message:"bus id not found"
            })
        }
        if (!mongoose.Types.ObjectId.isValid(busId)) {
            return res.status(400).json({
                message: "Invalid bus id"
            });
        }
        const bus=await Bus.findByIdAndDelete(busId);
        if(!bus){
            return res.status(404).json({
                message:"Bus not found"
            })
        }
        res.status(200).json({
            message:"Bus schedule deleted successfully",
            bus
        })
    }catch(err){
        res.status(500).json({
            message:err.message
        })
    }
}
//KYC

//submit kyc
const submitKyc=async (req,res)=>{
    try{
        const userId=req.result._id;
        if(!userId){
            return res.status(400).json({
                message:"User id not found"
            })
        }

        const {aadharFront,aadharBack,selfie}=req.body;
        if(!aadharFront || !aadharBack || !selfie){
            return res.status(400).json({
                message:"Required fields are missing"
            })
        }

        const alreadyExist=await KYCmodel.findOne({userId});
        if(alreadyExist){
            return res.status(400).json({
                message:"KYC already submitted"
            })
        }

        const kyc=await KYCmodel.create({
            userId,
            aadharFront,aadharBack,
            selfie
        });

        res.status(200).json({
            message:"KYC sent successfully",
            kyc
        })
    }catch(err){
        res.status(500).json({
            message:err.message
        })
    }
}
//get mykYC detail
const getMyKyc=async (req,res)=>{
    try{
        const userId=req.result._id;
        if(!userId){
            return res.status(400).json({
                message:"user id not found"
            })
        }

        const kyc=await KYCmodel.findOne({userId});
        if(!kyc){
            return res.status(404).json({
                message:"KYC not found"
            })
        }
        res.status(200).json({
            kyc
        })
    }catch(err){
        res.status(500).json({
            message:err.message
        })
    }
}
//get all pending kyc
const getPendingKyc=async (req,res)=>{
    try{
        const page=parseInt(req.query.page)||1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const totalKyc=await KYCmodel.countDocuments({status:"pending"});
        const kyc=await  KYCmodel.find({status:"pending"})
        .populate("userId",
            "username email phoneNumber"
        ).sort({createdAt:-1})
        .skip(skip).limit(limit)
        

        if(kyc.length===0){
            return res.status(404).json({
                message:"No pending kyc found"
            })
        }
        const totalPages=Math.ceil(totalKyc/limit);
        
        if(page > totalPages && totalKyc > 0){
            return res.status(400).json({
                message: "Page does not exist"
            });
        }
        res.status(200).json({
            totalKyc,
            totalPages,
            currentPage: page,

            hasNextPage: page < totalPages,

            hasPrevPage: page > 1,

            kyc
        })
    }catch(err){
        res.status(500).json({
            message:err.message
        })
    }
}
//Approve kyc
const approveKyc=async(req,res)=>{
    try{

        const {_id}=req.params;
        if(!_id){
            return res.status(400).json({
                message:"Id not found"
            })
        }

        if (!mongoose.Types.ObjectId.isValid(_id)) {
            return res.status(400).json({
                message: "Invalid KYC id"
            });
        }
        const kyc=await KYCmodel.findById(_id);

        if(!kyc){
            return res.status(404).json({
                message:"KYC not found!"
            });
        }
        if (kyc.status === "approved") {
            return res.status(400).json({
                message: "KYC already approved"
            });
        }

        if (kyc.status === "rejected") {
            return res.status(400).json({
                message: "Rejected KYC cannot be approved"
            });
        }

        kyc.status="approved";

        kyc.verifiedBy=req.result._id;

        kyc.verifiedAt=new Date();
        await kyc.save();

        res.status(200).json({
            message:"KYC approved!",
            kyc
        });

    }catch(err){
        res.status(500).json({
            message:err.message
        });
    }
};
//Reject kyc
const rejectKYC=async(req,res)=>{
    try{

        const {_id}=req.params;
        if(!_id){
            return res.status(409).json({
                message:"Id not found"
            })
        }
        if (!mongoose.Types.ObjectId.isValid(_id)) {
            return res.status(400).json({
                message: "Invalid KYC id"
            });
        }
        const {reason}=req.body;
        const kyc=await KYCmodel.findById(_id);

        if(!kyc){
            return res.status(404).json({
                message:"KYC not found!"
            });
        }

        kyc.status="rejected";

        kyc.rejectionReason=reason || "Documents mismatch";
            

        kyc.verifiedBy=req.result._id;

        kyc.verifiedAt=new Date();

        await kyc.save();

        res.status(200).json({
            message:"KYC rejected!",
            kyc
        });

    }catch(err){
        res.status(500).json({
            message:err.message
        });
    }
};
//receipt  ,create notification ,my notification , mark notification

//help number
const getAdminContacts = async (req, res) => {
    try {
        const admins = await User.find(
            { role: "admin" },
            "_id username phoneNumber"
        );

        if (admins.length === 0) {
            return res.status(404).json({
                message: "No admins found"
            });
        }

        res.status(200).json({
            admins
        });

    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};

//const getRentalAggremnt

//create announcement
const createAnnouncement = async (req, res) => {
    try {

        const adminId = req.result._id;

        if (!adminId) {
            return res.status(400).json({
                message: "Admin Id not present"
            });
        }

        let { title, description } = req.body;

        if (!title || !description) {
            return res.status(400).json({
                message: "Required fields are missing"
            });
        }

        title = title.trim();
        description = description.trim();

        const expiresAt = new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
        );

        const announcement =await Announcement.create({
                title,
                description,
                createdBy: adminId,
                expiresAt
            });

            
        res.status(201).json({
            message: "Announcement created successfully",
            announcement
        });

    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};
//update announcement
const updateAnnouncement = async (req, res) => {
    try {

        const adminId = req.result._id;

        if (!adminId) {
            return res.status(400).json({
                message: "Admin id not found"
            });
        }

        const { announcementId } = req.params;

        if (!announcementId) {
            return res.status(400).json({
                message: "Announcement id is required"
            });
        }

        let { title, description } = req.body;
        if (!title && !description) {
            return res.status(400).json({
                message: "At least one field is required"
            });
        }
        const announcement =await Announcement.findById(announcementId);
            
        if (!announcement) {
            return res.status(404).json({
                message: "Announcement not found"
            });
        }

        if (title) {
            title = title.trim();
            if (title.length === 0) {
                return res.status(400).json({
                    message: "Title cannot be empty"
                });
            }

            announcement.title = title;
        }

        if (description) {
            description = description.trim();

            if (description.length === 0) {
                return res.status(400).json({
                    message:
                        "Description cannot be empty"
                });
            }

            announcement.description =description;
        }

        await announcement.save();

        res.status(200).json({
            message:"Announcement updated successfully",
            announcement
        });

    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};

//get all annoucement
const getAnnouncements = async (req, res) => {
    try {

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        if (page < 1 || limit < 1) {
            return res.status(400).json({
                message: "Page and limit must be greater than 0"
            });
        }

        const skip = (page - 1) * limit;

        const [totalAnnouncements, announcements] =await Promise.all([
                Announcement.countDocuments(),
                Announcement.find()
                    .populate("createdBy", "username")
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
            ]);

            
        const totalPages =Math.max(1, Math.ceil(totalAnnouncements / limit));
    
        if (page > totalPages &&totalAnnouncements > 0) {
            return res.status(400).json({
                message: "Page does not exist"
            });
        }

        res.status(200).json({
            totalAnnouncements,
            totalPages,
            currentPage: page,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
            announcements
        });

    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};

//delete announcement
const deleteAnnouncement = async (req, res) => {
    try {
        const { announcementId } = req.params;
        if(!announcementId){
            return res.status(400).json({
                message:"announcement is missing"
            })
        }

        if (!mongoose.Types.ObjectId.isValid(announcementId)) {
            return res.status(400).json({
                message: "Invalid announcement id"
            });
        }
        
        const announcement =await Announcement.findByIdAndDelete(announcementId);
            

        if (!announcement) {
            return res.status(404).json({
                message: "Announcement not found"
            });
        }

        res.status(200).json({
            message:
                "Announcement deleted successfully"
        });

    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};
module.exports={verifyOTP,resendOTP,studentDashboard,adminDashboard,
registerAdmin,loginAdmin,registerStudent,loginStudent,
logout,deleteStudent,allResidentStudents,getStudentByCollege,
pastStudents,isSpace,createMenu,getMenu,getMenuByDay,
todayMenu,updateMessMenu,deleteMenu,fileComplaint,
updateComplaint,myComplaints,deleteComplaint,resolveComplaint,
viewComplaint,viewRoomComplaint,viewComplaintByStatus,
complaintStats,studentProfile, adminProfile,updateMyProfile,updateProfileByAdmin,
createFeeStructure,getMyFees,getPendingFees,payFee,
createRoom,updateRoom,getAllRooms,getRoomByNumber,
deleteRoom,shiftStudentRoom,searchStudent ,applyLeave,
returnToHostel,studentsOnLeave,createBus,updateBus,
viewBus,deleteBus,submitKyc,getMyKyc,getPendingKyc,
approveKyc,rejectKYC,getAdminContacts ,createAnnouncement,
updateAnnouncement,getAnnouncements,deleteAnnouncement
}