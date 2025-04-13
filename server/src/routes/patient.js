const express = require("express");
const Patient = require("../models/Patient");
const User = require("#@/models/User.js");

const router = express.Router();

// Create a new patient
router.post("/", async (req, res) => {
    try {
        const patient = new Patient(req.body);
        await patient.save();
        await User.findOneAndUpdate(
            { id: patient.user_id },
            { role: "patient" },
            { new: true }
        );

        res.status(201).json({ patient });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Read a specific patient by ID
router.get("/:id", async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return res.status(404).send({ message: "Patient not found" });
        }
        res.status(200).send(patient);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Route to find a patient by user_id
router.get("/user/:userId", async (req, res) => {
    try {
        const patient = await Patient.findOne({ user_id: req.params.userId });
        if (!patient) {
            return res.status(404).send({ message: "Patient not found" });
        }
        res.status(200).send(patient);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Update a patient by ID
router.put("/:id", async (req, res) => {
    try {
        const patient = await Patient.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );
        if (!patient) {
            return res.status(404).send({ message: "Patient not found" });
        }
        res.status(200).send(patient);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Delete a patient by ID
router.delete("/:id", async (req, res) => {
    try {
        const patient = await Patient.findByIdAndDelete(req.params.id);
        if (!patient) {
            return res.status(404).send({ message: "Patient not found" });
        }
        res.status(200).send({ message: "Patient deleted successfully" });
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;
