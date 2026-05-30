const mongoose = require("mongoose");

const outingSchema = new mongoose.Schema({

    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true
    },

    category: {
        type: String,
        enum: [
            "home",
            "friends",
            "market",
            "hospital",
            "coaching",
            "other"
        ],
        required: true
    },

    customReason: {
        type: String,
        trim: true
    },

    expectedReturnTime: {
        type: Date
    },

    status: {
        type: String,
        enum: [
            "out",
            "returned"
        ],
        default: "out"
    }

}, { timestamps: true });

module.exports =
    mongoose.model(
        "Outing",
        outingSchema
    );