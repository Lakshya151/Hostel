const User = require("../models/User");

const createDefaultAdmin = async () => {
    try {
        const email = "lakshyar341@gmail.com".trim().toLowerCase();

        const existingAdmin = await User.findOne({ email });

        if (existingAdmin) {
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

        console.log("Default admin created successfully");

    } catch (err) {
        console.log("Error creating default admin:", err.message);
    }
};

module.exports = createDefaultAdmin;