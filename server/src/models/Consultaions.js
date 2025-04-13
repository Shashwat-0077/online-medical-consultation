const mongoose = require("mongoose");

const consultationSchema = new mongoose.Schema(
    {
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: true,
        },
        doctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor",
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
        time: {
            type: String,
            required: true,
        },
        symptoms: {
            type: [String],
            required: true,
        },
        diagnosis: {
            type: String,
        },
        prescription: {
            type: String,
        },
        notes: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

const Consultation = mongoose.model("Consultation", consultationSchema);

module.exports = Consultation;
