const express = require('express');
const router = express.Router();
const uuidController = require('../controllers/uuidController');

// Route for generating UUIDs
router.get('/', uuidController.generateUUIDs);

module.exports = router;
