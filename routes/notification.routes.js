const express = require('express');
const notificationController = require('../controllers/notification.controller');

const router = express.Router();

// routes
router.get('/resolve/:type/:token/:response', notificationController.resolve);

module.exports = router;
