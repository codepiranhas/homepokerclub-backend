const express = require('express');
const uploadController = require('../controllers/upload.controller');

const router = express.Router();

// routes
router.post('/getSignedUrl', uploadController.getSignedUrl);
router.delete('/deleteAvatar', uploadController.deleteAvatar);

module.exports = router;
