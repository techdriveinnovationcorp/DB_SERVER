const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/', userController.allDocs);
router.get('/:id', userController.allDocs);
router.post('/searchDoc', userController.searchDoc);
router.post('/', userController.save);
router.post('/:id', userController.save);
router.delete('/:id', userController.delete);

module.exports = router;
