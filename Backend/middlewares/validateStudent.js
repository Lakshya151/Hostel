const validator=require('validator');

const validateStudent= (data)=>{
    const mandatoryField=['username','email','phoneNumber','aadhar','password','roomNo','course','year','guardianName','guardianPhone','feeDue'];
    const isAllowed=mandatoryField.every((k)=>Object.keys(data).includes(k));
    if(!isAllowed){
        throw new Error("Required field/fields are missing");
    }
    if(!validator.isMobilePhone(data.phoneNumber,'en-IN'))throw new Error("Number is wrong");
    if(!validator.isMobilePhone(data.guardianPhone,'en-IN'))throw new Error("Number is wrong");
    if(!validator.isStrongPassword(data.password))throw new Error("Weak Password");
    if(data.username.length<3 ||data.username.length>50)throw new Error("Name is too long /short");
    if(data.guardianName.length<3 ||data.guardianName.length>50)throw new Error("Name is too long /short");
    if (!/^[0-9]{12}$/.test(data.aadhar)) {
        throw new Error("Invalid Aadhaar number");
    }
    if (!validator.isEmail(data.email)) {
        throw new Error("Invalid email");
    }
}

module.exports=validateStudent;