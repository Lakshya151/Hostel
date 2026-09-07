const mongoose = require("mongoose");
const { Schema } = mongoose;

const workerSchema = new Schema({

    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },

    workerType: {
        type: String,
        enum: ["lunchbox"],
        default: "lunchbox"
    },

    isActive: {
        type: Boolean,
        default: true
    }

}, {
    timestamps: true
});

module.exports = mongoose.model("worker", workerSchema);