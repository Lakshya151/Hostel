const mongoose = require("mongoose");
const { Schema } = mongoose;

const messSchema = new Schema({

    day: {
        type: String,
        enum: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday"
        ],
        required: true
    },

    breakfast: {
        type: String,
        required: true,
        trim: true
    },

    lunch: {
        type: String,
        required: true,
        trim: true
    },

    snacks: {
        type: String,
        trim: true
    },

    dinner: {
        type: String,
        required: true,
        trim: true
    },

    type: {
        type: String,
        enum: ["veg", "non-veg"],
        required: true
    }

}, { timestamps: true });

module.exports = mongoose.model("Mess", messSchema);