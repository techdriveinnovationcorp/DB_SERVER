const express = require('express');
const router = express.Router();
const designerDbController = require('../controllers/designerDbController');

router.get('/', designerDbController.allDocs);
router.get('/:id', designerDbController.allDocs);
router.post('/searchDoc', designerDbController.searchDoc);
router.post('/', designerDbController.save);
router.post('/:id', designerDbController.save);
router.delete('/:id', designerDbController.delete);

module.exports = router;
