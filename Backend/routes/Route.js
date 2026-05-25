const express=require('express');
const adminMiddleware=require('../middlewares/adminMiddleware');
const studentMiddleware=require('../middlewares/studentMiddleware');
const {registerAdmin,registerStudent,loginAdmin,loginStudent, searchStudent,
     isSpace, menu,
     getMenu,
     getMenuByDay,
     updateMessMenu,
     deleteMenu,
     fileComplaint,
     deleteComplaint,
     resolveComplaint,
     viewComplaint,
     viewRoomComplaint}=require('../controllers/authRandL');
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
//search student
router.get('/searchStudent',adminMiddleware,searchStudent);
//check if room has space
router.post('/isSpace',adminMiddleware,isSpace);
//create menu
router.post('/menu',adminMiddleware,menu);
//get menu
router.get('/getMenu',getMenu);
//get menu by day
router.get('/getMenuByDay/:day',getMenuByDay);
//update menu
router.patch('/updateMessMenu',adminMiddleware,updateMessMenu);
//delete menu by day
router.delete('/deleteMenu/:day',adminMiddleware,deleteMenu);
//file complaint
router.post('/fileComplaint',fileComplaint);
//delete complaint
router.delete('/deleteComplaint',studentMiddleware,deleteComplaint);
//resolve  Complaint
router.patch('/resolveComplaint/:roomNo',studentMiddleware,resolveComplaint);
//view all complaint
router.get('/viewComplaint',adminMiddleware,viewComplaint);
//view Complaint by room
router.get('/viewRoomComplaint/:roomNo',viewRoomComplaint);

module.exports=router;