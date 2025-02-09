const Person = require('../models/person');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const admin = require("firebase-admin");

// Send Notification Function
const sendNotification = async (title, body) => {
    const message = {
        notification: {
            title,
            body
        },
        android: {
            notification: {
                sound: "default",
                click_action: "FLUTTER_NOTIFICATION_CLICK"
            }
        },
        data: {
            packageName: "com", // Change to your app's package name
        },
        topic: "person_updates"
    };

    try {
        await admin.messaging().send(message);
        console.log("Notification sent successfully!");
    } catch (error) {
        console.error("Error sending notification:", error);
    }
};

const addPerson = async (req, res) => {
    const { name, imageUrl, count } = req.body;

    try {
        const existingPerson = await Person.findOne({ name });
        if (existingPerson) {
            return res.status(400).json({ error: 'Person with this name already exists' });
        }

        const imageData = imageUrl.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(imageData, 'base64');
        const now = new Date();
        const formattedDate = now.toISOString().replace(/[-:T.]/g, '').slice(0, 14);
        const filename = `${formattedDate}.png`;
        const imagePath = path.join(__dirname, '../images', filename);

        fs.writeFileSync(imagePath, buffer);

        const pid = uuidv4();
        const newPerson = new Person({
            pid,
            name,
            imageUrl: `/images/${filename}`,
            count
        });

        await newPerson.save();
        await sendNotification("New Person Added", `${name} has been added.`);

        res.status(201).json({ message: 'Person created successfully', pid });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create person', details: error });
    }
};

const updatePerson = async (req, res) => {
    const { pid, name, imageUrl, count } = req.body;

    try {
        const person = await Person.findOne({ pid });
        if (!person) {
            return res.status(404).json({ error: 'Person not found' });
        }

        if (imageUrl) {
            const oldImagePath = path.join(__dirname, '../', person.imageUrl);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }

            const imageData = imageUrl.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(imageData, 'base64');
            const now = new Date();
            const formattedDate = now.toISOString().replace(/[-:T.]/g, '').slice(0, 14);
            const filename = `${formattedDate}.png`;
            const imagePath = path.join(__dirname, '../images', filename);

            fs.writeFileSync(imagePath, buffer);
            person.imageUrl = `/images/${filename}`;
        }

        if (name) person.name = name;
        if (count !== undefined) person.count = count;

        await person.save();
        await sendNotification("Person Updated", `${name} has been updated.`);

        res.status(200).json({ message: 'Person updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update person', details: error });
    }
};

const deletePerson = async (req, res) => {
    const { pid } = req.body;

    try {
        const person = await Person.findOne({ pid });
        if (!person) {
            return res.status(404).json({ error: 'Person not found' });
        }

        const imagePath = path.join(__dirname, '../', person.imageUrl);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }

        await Person.findOneAndDelete({ pid });
        await sendNotification("Person Deleted", `${person.name} has been removed.`);

        res.status(200).json({ message: 'Person deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete person', details: error });
    }
};

const getAllPersons = async (req, res) => {
    try {
        let { page } = req.query;
        page = parseInt(page) || 1;
        const limit = 5;
        const skip = (page - 1) * limit;

        const persons = await Person.find()
            .select('-_id -__v')
            .skip(skip)
            .limit(limit);

        const totalPersons = await Person.countDocuments();

        res.status(200).json({
            RetrunDesc: "Success",
            RetrunCode: 200,
            currentPage: page,
            totalPages: Math.ceil(totalPersons / limit),
            totalPersons,
            persons
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch persons', details: error });
    }
};

module.exports = { addPerson, getAllPersons, deletePerson, updatePerson };
