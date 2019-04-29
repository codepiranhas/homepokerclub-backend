const express = require('express');
const userController = require('../controllers/user.controller');
// const config = require('../config/keys');

const router = express.Router();

// routes
router.post('/authenticate', userController.authenticate);
router.post('/register', userController.register);
router.get('/confirmNewUser/:token', userController.confirmNewUser);
router.post('/forgotPassword', userController.forgotPassword);
router.get('/validateResetPasswordToken/:token', userController.validateResetPasswordToken);
router.post('/resetPassword', userController.resetPassword);

module.exports = router;
