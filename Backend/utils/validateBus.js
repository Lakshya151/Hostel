const validator=require('validator');

const validateBus=(data)=>{
    const mandatoryField=['busNo','route','hostelToCollege','collegeToHostel'];
    const isAllowed=mandatoryField.every((k)=>Object.keys(data).includes(k));
    
    if(!isAllowed)throw new Error("required fields are missing");

    if(data.busNo.length==0)throw new Error("bus number is invalid");
    if(data.route.length<2 ||data.route.length>50)throw new Error("route is too long");
    
}

module.exports=validateBus;