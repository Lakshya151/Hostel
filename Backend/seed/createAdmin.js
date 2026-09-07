const User = require("../models/User");

const createDefaultAdmin = async () => {
    try {
        const email = "lakshyar341@gmail.com".trim().toLowerCase();
        const email2="roddin1534@gmail.com".trim().toLocaleLowerCase();

        const existingAdmin = await User.findOne({ email });
        const existingAdmin2=await User.findOne({email:email2});

        if (existingAdmin ||existingAdmin2) {
            console.log("Admin already exists");
            return;
        }

        await User.create({
            username: "Lakshya",
            email: email,
            aadhar: "423716339865",
            phoneNumber: "7895694667",
            role: "admin",
            age: 21
        });
         await User.create({
            username: "MB Surya ",
            email: email2,
            aadhar: "423716339871",
            phoneNumber: "7982320898",
            role: "admin",
            age: 21
        });

        console.log("Default admin created successfully");

    } catch (err) {
        console.log("Error creating default admin:", err.message);
    }
};

module.exports = createDefaultAdmin;