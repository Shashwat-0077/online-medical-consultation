const express = require("express");
const Consultation = require("../models/Consultaions");

const router = express.Router();

// Create a new consultation
router.post("/", async (req, res) => {
    try {
        const consultation = new Consultation(req.body);
        await consultation.save();
        res.status(201).json(consultation);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get a specific consultation by ID
router.get("/:id", async (req, res) => {
    try {
        const consultation = await Consultation.findById(req.params.id);
        if (!consultation) {
            return res.status(404).json({ message: "Consultation not found" });
        }
        res.status(200).json(consultation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get consultations by doctor ID
router.get("/doctor/:doctorId", async (req, res) => {
    try {
        const consultations = await Consultation.find({
            doctorId: req.params.doctorId,
        });
        res.status(200).json(consultations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get consultations by patient ID
router.get("/patient/:patientId", async (req, res) => {
    try {
        const consultations = await Consultation.find({
            patientId: req.params.patientId,
        });
        res.status(200).json(consultations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update a consultation by ID
router.put("/:id", async (req, res) => {
    try {
        const consultation = await Consultation.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );
        if (!consultation) {
            return res.status(404).json({ message: "Consultation not found" });
        }
        res.status(200).json(consultation);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a consultation by ID
router.delete("/:id", async (req, res) => {
    try {
        const consultation = await Consultation.findByIdAndDelete(
            req.params.id
        );
        if (!consultation) {
            return res.status(404).json({ message: "Consultation not found" });
        }
        res.status(200).json({ message: "Consultation deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
