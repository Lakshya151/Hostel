require("dotenv").config();

const nodemailer = require("nodemailer");

// CREATE TRANSPORTER
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// SEND MAIL FUNCTION , 
const sendMail = async (to,subject,html) => {//to->receiver mail

    try {
        const info =await transporter.sendMail({
                from: `"Hostel Management" <${process.env.EMAIL_USER}>`,
                to,
                subject,
                html
            });

        console.log(
            "Email sent:",
            info.messageId
        );

    } catch (error) {

        console.log(
            "Mail Error:",
            error.message
        );

        throw new Error(
            "Failed to send email"
        );
    }
};

module.exports = sendMail;