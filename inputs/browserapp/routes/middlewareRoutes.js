const express = require('express');
const router = express.Router();
const middlewareController = require('../controllers/middlewareController.js');

router.post('/saveWithValidation', middlewareController.saveWithValidation);
router.post('/fetchStreamWithMiddleware', middlewareController.fetchStreamWithMiddleware)

module.exports = router;
