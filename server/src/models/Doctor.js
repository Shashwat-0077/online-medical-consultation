const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
    name: { type: String, default: "" },
    gender: { type: String, default: "" },
    age: { type: Number, default: "" },
    street_address: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    zip_code: { type: String, default: "" },
    addition_information: { type: String, default: "" },
    specialization: { type: String, default: "" },
    working_hours: [
        {
            from: { type: Date, default: "" },
            to: { type: Date, default: "" },
            is_holiday: { type: Boolean, default: false },
        },
    ],
});

const Doctor = mongoose.model("Doctor", doctorSchema);
module.exports = Doctor;
