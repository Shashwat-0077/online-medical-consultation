const express = require("express");
const User = require("../models/User");

const router = express.Router();

// Create a new user
router.post("/", async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        console.log("reached");
        res.status(201).json({ user: user });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get a specific user by ID
router.get("/:id", async (req, res) => {
    try {
        const user = await User.findOne({ id: req.params.id });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get the user type by ID
router.get("/:id/role", async (req, res) => {
    try {
        const user = await User.findOne({ id: req.params.id });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ role: user.role });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update a user by ID
router.put("/:id", async (req, res) => {
    try {
        const user = await User.findOneAndUpdate(
            { id: req.params.id },
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a user by ID
router.delete("/:id", async (req, res) => {
    try {
        const user = await User.findOneAndDelete({ id: req.params.id });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
