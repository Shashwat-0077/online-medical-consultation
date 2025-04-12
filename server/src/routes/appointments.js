const express = require("express");
const Appointment = require("../models/Appointment");

const router = express.Router();

// Get appointments by doctor ID
router.get("/doctor/:doctorId", async (req, res) => {
    try {
        const appointments = await Appointment.find({
            doctorId: req.params.doctorId,
        });
        res.status(200).send(appointments);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Get appointments by patient ID
router.get("/patient/:patientId", async (req, res) => {
    try {
        const appointments = await Appointment.find({
            patientId: req.params.patientId,
        });
        res.status(200).send(appointments);
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;
