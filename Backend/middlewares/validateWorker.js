const validator=('validator');

const validateWorker =(data)=>{
    const mandatoryField=['username','email','phoneNumber','aadhar','address'];
    const isAllowed=mandatoryField.every((k)=>Object.keys(data).includes(k));
    if(!isAllowed){
        throw new Error("Required field/fields are missing");
    }
    if(data.username.length <3 || data.username.length >75){
        if(data.username <3){
            throw new Error("Username is too small!")
        }else{
            throw new Error("Username is too long!")
        }
    }
    //phone number validation
    if(!validator.isMobilePhone(data.phoneNumber ,'en-IN')){
        throw new Error("Invalid phone number");
    }
    if(!/^[0-9]{12}$/.test(data.aadhar)){
        throw new Error("Invalid Aadhar number");
    }
    if(!validator.isEmail(data.email)){
        throw new Error("Invalid email address!");
    }
    if(!data.address || typeof data.address!=="object"){
        throw  new Error("Address is required!")
    }

    const {village,city,state,pincode ,country}=data.address;
    if(!city || !state || !pincode){
        throw new Error("City, state and pincode are required!");
    }
    if(village && village.length > 75){
        throw new Error("Village name is too big!");
    }

    if(!validator.isPostalCode(pincodem,'IN')){
        throw new Error("Invalid Pincode!");
    }
    if(!country && country.length >75 ){
        throw new Error("Country name is absent or too big!");
    }
};

module.exports=validateWorker;