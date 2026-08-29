// const dns = require("dns");

// dns.setServers(["8.8.8.8", "1.1.1.1"]);
// require('dotenv').config();
// const express=require('express');
// const main=require('./config/db');
// const cookieParser = require('cookie-parser');
// const redisClient = require('./config/redis');
// const app=express();
// const router=require('./routes/Route');
// const cors=require('cors');//npm install cors
// app.use(cors({
//     origin:'http://localhost:5173',//port of frontend
//     credentials:true
// }))
// app.use(express.json());
// app.use(cookieParser());

// app.use('/user',router);
// const initilizeConnection=async ()=>{
//     try{
//         await Promise.all([main(),redisClient.connect()]);
//         console.log("DB connected!");
//         app.listen(process.env.PORT,()=>{
//             console.log("Listening... ")
//         })
//     }catch(err){
//         console.log("Error: "+err.message);
//     }
// }

// initilizeConnection(); 
const dns = require("dns");

dns.setServers(["8.8.8.8", "1.1.1.1"]);

require("dotenv").config();

const express = require("express");
const main = require("./config/db");
const cookieParser = require("cookie-parser");
const redisClient = require("./config/redis");
const createDefaultAdmin = require("./seed/createAdmin");

const app = express();

const router = require("./routes/Route");
const cors = require("cors");

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use("/user", router);

const initilizeConnection = async () => {
    try {

        await Promise.all([
            main(),
            redisClient.connect()
        ]);

        await createDefaultAdmin();

        console.log("DB connected!");

        app.listen(process.env.PORT, () => {
            console.log("Listening...");
        });

    } catch (err) {
        console.log("Error: " + err.message);
    }
};

initilizeConnection();