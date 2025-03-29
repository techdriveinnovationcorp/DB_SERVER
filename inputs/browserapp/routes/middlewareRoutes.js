const express = require('express');
const router = express.Router();
const middlewareController = require('../controllers/middlewareController.js');

router.post('/saveWithValidation', middlewareController.saveWithValidation);

module.exports = router;
