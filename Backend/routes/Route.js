const express=require('express');
const adminMiddleware=require('../middlewares/adminMiddleware');
const studentMiddleware=require('../middlewares/studentMiddleware');
const commonMiddleware=require('../middlewares/commonMiddleware')
const redisClient=require('../config/redis');
const {registerAdmin,registerStudent,loginAdmin,loginStudent, searchStudent,
     isSpace, createMenu,
     getMenu,
     getMenuByDay,
     updateMessMenu,
     deleteMenu,
     fileComplaint,
     deleteComplaint,
     resolveComplaint,
     viewComplaint,logout,
     viewRoomComplaint,
     verifyOTP,
     resendOTP,
     studentDashboard,
     adminDashboard,
     deleteStudent,
     allResidentStudents,
     getStudentByCollege,
     pastStudents,
     todayMenu,
     updateComplaint,
     viewComplaintByStatus,
     complaintStats,
     studentProfile,
     adminProfile,
     updateMyProfile,
     updateProfileByAdmin,
     createFeeStructure,
     getMyFees,
     getPendingFees,
     payFee,
     createRoom,
     updateRoom,
     getAllRooms,
     getRoomByNumber,
     deleteRoom,
     shiftStudentRoom,
     applyLeave,
     returnToHostel,
     studentsOnLeave,
     createBus,
     updateBus,
     viewBus,
     deleteBus,
     submitKyc,
     getMyKyc,
     getPendingKyc,
     approveKyc,
     rejectKYC,
     getAdminContacts,
     createAnnouncement,
     updateAnnouncement,
     getAnnouncements,
     deleteAnnouncement,
     myComplaints}=require('../controllers/authRandL');
const validateStudent = require('../middlewares/validateStudent');


const router=express.Router();

//register admin
router.post('/registerAdmin',adminMiddleware,registerAdmin);
//register student
router.post('/registerStudent',adminMiddleware,registerStudent);
//login admin
router.post('/loginAdmin',loginAdmin);
//login student
router.post('/loginStudent',loginStudent);
//logout
router.post('/logout',logout);
//verifyOTP
router.post('/verifyOtp',verifyOTP);
//resend OTP
router.post('/resendOtp',resendOTP);
//student DashBoard
router.get('/studentDashboard',studentMiddleware,studentDashboard);
//admin Dashboard
router.get('/adminDashboard',adminMiddleware,adminDashboard)
//delete student
router.delete('/deleteStudent/:id',adminMiddleware,deleteStudent);
//all Resident students
router.get('/allResidentStudents',adminMiddleware,allResidentStudents);
//get students by college
router.get('/getStudentByCollege/:collegeName',adminMiddleware,getStudentByCollege);
//past Students
router.get('/pastStudents',adminMiddleware,pastStudents);
//search student
router.get('/searchStudent',adminMiddleware,searchStudent);
//check if room has space
router.get('/isSpace/:roomNo',adminMiddleware,isSpace);
//create menu
router.post('/createMenu',adminMiddleware,createMenu);
//get menu
router.get('/getMenu',getMenu);
//get menu by day
router.get('/getMenuByDay/:day',getMenuByDay);
//today's menu
router.get('/todayMenu',todayMenu);
//update menu
router.patch('/updateMessMenu/:day/:type',adminMiddleware,updateMessMenu);
//delete menu by day
router.delete('/deleteMenu/:day/:type',adminMiddleware,deleteMenu);
//file complaint
router.post('/fileComplaint',commonMiddleware,fileComplaint);
//update complaint
router.patch('/updateComplaint/:_id',adminMiddleware,updateComplaint);
//delete complaint
router.delete('/deleteComplaint/:_id',commonMiddleware,deleteComplaint);
//resolve  Complaint
router.patch("/resolveComplaint/:_id",commonMiddleware,resolveComplaint);
//view all complaint
router.get('/viewComplaint',adminMiddleware,viewComplaint);
//view mycomplaint
router.get('/myComplaints',commonMiddleware,myComplaints)
//view Complaint by room
router.get('/viewRoomComplaint/:roomNo',viewRoomComplaint);
//view complaint by status
router.get('/viewComplaintByStatus',adminMiddleware,viewComplaintByStatus);
//complaint stats
router.get('/complaintStats',adminMiddleware,complaintStats);
//studentProfile
router.get('/studentProfile/:studentId',commonMiddleware,studentProfile);
//adminProfile
router.get('/adminProfile',adminMiddleware,adminProfile);
//updateProfile
router.patch('/updateMyProfile',studentMiddleware,updateMyProfile);
//update profile by admin
router.patch('/updateProfileByAdmin/:id',adminMiddleware,updateProfileByAdmin);
//create fee structure
router.post('/createFeeStructure',adminMiddleware,createFeeStructure);
//get mt fee
router.get('/getMyFees',studentMiddleware,getMyFees);
//getPending Fees
router.get('/getPendingFees',adminMiddleware,getPendingFees);
//pay fee
router.post('/payFee',payFee);
//create Room
router.post('/createRoom',adminMiddleware,createRoom);
//update Room
router.patch('/updateRoom/:roomNo',adminMiddleware,updateRoom);
//getAllRooms
router.get('/getAllRooms',adminMiddleware,getAllRooms);
//getRoomByNumber
router.get('/getRoomByNumber/:roomNo',adminMiddleware,getRoomByNumber);
//deleteRoom
router.delete('/deleteRoom/:roomNo',adminMiddleware,deleteRoom);
//shift student room
router.patch('/shiftStudentRoom/:studentId',adminMiddleware,shiftStudentRoom);
//search student
router.get('/searchStudent',adminMiddleware,searchStudent);
//appy leave
router.post('/applyLeave',applyLeave);
//returnToHostel
router.post('/returnToHostel',returnToHostel);
//studentOnLeave
router.get('/studentOnLeave',adminMiddleware,studentsOnLeave);
//createBus
router.post('/createBus',adminMiddleware,createBus);
//updateBus
router.patch('/updateBus/:busId',adminMiddleware,updateBus);
//view Bus
router.get('/viewBus',viewBus);
//delete Bus
router.delete('/deleteBus/:busId',adminMiddleware,deleteBus);
//submitKyc
router.post('/submitKyc/',submitKyc);
//get My kyc
router.get('/getMyKyc',getMyKyc);
//get Pending kyc
router.get('/getPendingKyc',adminMiddleware,getPendingKyc);
//approveKyc
router.post('/approveKyc/:_id',adminMiddleware,approveKyc);
//rejectKyc
router.post('/rejectKyc/:_id',adminMiddleware,rejectKYC);
//get Admin contacts
router.get('/getAdminContacts',studentMiddleware,getAdminContacts);
//create Announcement
router.post('/createAnnouncement',adminMiddleware,createAnnouncement);
//update Announcement
router.patch('/updateAnnouncement/:announcementId',adminMiddleware,updateAnnouncement);
//get Announcement
router.get('/getAnnouncement',getAnnouncements);
//delete announcement
router.delete('/deleteAnnouncement/:announcementId',adminMiddleware,deleteAnnouncement);

module.exports=router;