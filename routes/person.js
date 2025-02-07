const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const Person = require('../models/person');

// POST /person
router.post('/person', async (req, res) => {
    const { name, imageUrl, count } = req.body;
    const pid = uuidv4(); // Generate a unique pid

    // Decode the base64 image and save it to the file system
    const imageData = imageUrl.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(imageData, 'base64');
    const imagePath = path.join(__dirname, '../images', `${pid}.png`);

    fs.writeFile(imagePath, buffer, async (err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to save image' });
        }

        // Save the person to the database
        const newPerson = new Person({
            pid,
            name,
            imageUrl: `/images/${pid}.png`,
            count
        });

        try {
            await newPerson.save();
            res.status(201).json({ message: 'Person created successfully', pid: newPerson.pid });
        } catch (error) {
            res.status(500).json({ error: 'Failed to create person', details: error });
        }
    });
});

router.post("/getPerson", async (req, res, next) => {
    try {
        let persons;
        const { pid } = req.body;

        if (pid) {
            persons = await Person.findOne({ pid }).select('-_id -__v'); // Exclude _id and __v
            if (!persons) {
                return res.status(404).json({ message: 'Person not found' });
            }
        } else {
            persons = await Person.find().select('-_id -__v'); // Exclude _id and __v
        }

        res.status(200).json({
            RetrunDesc: "Success",
            RetrunCode: 200,
            persons
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch persons', details: error });
    }
});



module.exports = router;
