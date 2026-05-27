const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({

    roomNo: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    capacity: {
        type: Number,
        required: true,
        min: 1
    },
    student: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],

    floor: {
        type: Number,
        default: 1
    },

    type: {
        type: String,
        enum: ["single", "double", "triple"],
        default: "double"
    },
    isAC: {
        type: Boolean,
        default: false
    },

    status: {
        type: String,
        enum: ["available", "full", "maintenance"],
        default: "available"
    }

}, {
    timestamps: true
});

// auto update room status
roomSchema.pre('save', function(next) {

    if (this.student.length >= this.capacity) {
        this.status = "full";
    } else if (this.status !== "maintenance") {
        this.status = "available";
    }

    next();
});

module.exports = mongoose.model("Room", roomSchema);