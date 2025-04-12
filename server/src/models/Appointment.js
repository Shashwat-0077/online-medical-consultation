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

// Middleware to check if doctorId and patientId exist
appointmentSchema.pre("save", async function (next) {
    const Doctor = mongoose.model("Doctor");
    const Patient = mongoose.model("Patient");

    try {
        const doctorExists = await Doctor.findById(this.doctorId);
        if (!doctorExists) {
            throw new Error("Doctor with the provided ID does not exist.");
        }

        const patientExists = await Patient.findById(this.patientId);
        if (!patientExists) {
            throw new Error("Patient with the provided ID does not exist.");
        }

        next();
    } catch (error) {
        next(error);
    }
});

const Appointment = mongoose.model("Appointment", appointmentSchema);
module.exports = Appointment;
