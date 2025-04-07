const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient" },
    date: { type: Date, default: Date.now },
    time: { type: String, default: "" },
    status: {
        type: String,
        enum: ["pending", "completed", "canceled"],
        default: "pending",
    },
});
const Appointment = mongoose.model("Appointment", appointmentSchema);
module.exports = Appointment;
