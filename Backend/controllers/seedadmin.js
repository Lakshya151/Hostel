// require('dotenv').config({path:'../.env'});
// const mongoose = require('mongoose');
// const bcrypt = require('bcrypt');
// const User = require('../Models/user');

// (async () => {
//   await mongoose.connect(process.env.DB_CONNECT_STRING);

//   const emailId = "lakshyarajputr@gmail.com";
//   const password = "R@@tkaP@rind@";

//   const existing = await User.findOne({ email});
//   if (existing) {
//     console.log("Admin already exists");
//     process.exit();
//   }


//   await User.create({
//     username: "Lakshya",
//     email:email.trim().toLowerCase(),
//     password: hashed,
//     role: "admin",
//     age: 21
//   });

//   console.log("Admin created successfully");
//   process.exit();
// })();

require("dotenv").config({
    path: require("path").resolve(__dirname, "../.env")
});

const mongoose = require('mongoose');
const User = require('../models/User');

(async () => {
    try {

        await mongoose.connect(process.env.MONGO_URI);

        const email = "lakshyar341@gmail.com";

        const existing = await User.findOne({
            email: email.trim().toLowerCase()
        });

        if (existing) {
            console.log("Admin already exists");
            process.exit(0);
        }

        await User.create({
            username: "Lakshya",
            email: email.trim().toLowerCase(),

            aadhar:"423716339865",
            phoneNumber:"7895694667",
            role: "admin",
            age: 21
        });

        console.log("Admin created successfully");

        process.exit(0);

    } catch (err) {

        console.error(err.message);
        process.exit(1);

    }
})();