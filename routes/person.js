const express = require('express');
const router = express.Router();
const personController = require("../controllers/person");
const saveImage = require("../middlewares/saveImage"); // Import middleware

router.post('/addPerson', saveImage, personController.addPerson);
router.post('/getPersons', personController.getAllPersons);
router.post('/deletePerson', personController.deletePerson);
router.post('/updatePerson', personController.updatePerson);

module.exports = router;
