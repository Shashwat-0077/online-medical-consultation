const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    id: {
        type: String,
        required: [true, "User ID is required"],
        unique: [true, "User with that account already exists"],
    },
    role: {
        type: String,
        enum: ["patient", "doctor", "guest"],
        default: "guest",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
