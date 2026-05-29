const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({

    busNo: {
        type: String,
        required: true,
        minlength:10,
        maxlength:10
    },

    route: {
        type: String,
        required: true,
        trim:true
    },

    hostelToCollege: {
        type: String,
        required: true
    },

    collegeToHostel: {
        type: String,
        required: true
    },

}, {
    timestamps: true
});

module.exports = mongoose.model(
    "Bus",
    busSchema
);