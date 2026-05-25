require('dotenv').config({path:'../.env'});
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../Models/user');

(async () => {
  await mongoose.connect(process.env.DB_CONNECT_STRING);

  const emailId = "lakshyarajputr@gmail.com";
  const password = "R@@tkaP@rind@";

  const existing = await User.findOne({ email});
  if (existing) {
    console.log("Admin already exists");
    process.exit();
  }

  const hashed = await bcrypt.hash(password, 10);

  await User.create({
    username: "Lakshya",
    email:email.trim().toLowerCase(),
    password: hashed,
    role: "admin",
    age: 21
  });

  console.log("Admin created successfully");
  process.exit();
})();