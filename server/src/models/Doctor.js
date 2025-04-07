const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
    name: { type: String, default: "" },
    email: { type: String },
    password: { type: String },
    age: { type: Number, default: "" },
    location: { type: String, default: "" },
    specialization: { type: String, default: "" },
});

const Doctor = mongoose.model("Doctor", doctorSchema);
module.exports = Doctor;
