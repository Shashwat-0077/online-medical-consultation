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
    displayImage: {
        type: String,
        default: "",
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: [true, "Email already exists"],
    },
    name: {
        type: String,
        default: "",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
