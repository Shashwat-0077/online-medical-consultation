const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
    name: { type: String, default: "" },
    email: { type: String },
    password: { type: String },
    age: { type: Number, default: "" },
    location: { type: String, default: "" },
    medicalHistory: { type: String, default: "" },
    doctorId: [{ type: mongoose.Schema.Types.ObjectId, ref: "Doctor" }],
});
