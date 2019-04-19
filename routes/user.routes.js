const express = require('express');
const userController = require('../controllers/user.controller');
const config = require('../config/keys');

const router = express.Router();

function authenticate(req, res, next) {
	userController.authenticate(req.body)
		.then(user => res.json(user))
		.catch(err => next(err));
}

function register(req, res, next) {
	userController.register(req.body)
		.then(user => res.json(user))
		.catch(err => next(err));
}

function forgotPassword(req, res, next) {
	userController.forgotPassword(req.body)
		.then(() => res.json({ message: 'request successful' }))
		.catch(err => next(err));
}

function validateResetPasswordToken(req, res, next) {
	userController.validateResetPasswordToken(req.params.token)
		.then(msg => res.json(msg))
		.catch(err => next(err));
}

function confirmNewUser(req, res, next) {
	userController.confirmNewUser(req.params.token)
		.then(() => res.redirect(config.frontendUrl))
		.catch(err => next(err));
}

function resetPassword(req, res, next) {
	userController.resetPassword(req.body)
		.then(() => res.json({ message: 'change successful' }))
		.catch(err => next(err));
}

function getCurrent(req, res, next) {
	userController.getById(req.user.sub)
		.then((user) => {
			if (user) { return res.json(user); }

			return res.sendStatus(404);
		})
		.catch(err => next(err));
}

// function getAll(req, res, next) {
//     userController.getAll()
//         .then(users => res.json(users))
//         .catch(err => next(err));
// }

// function getById(req, res, next) {
//     userController.getById(req.params.id)
//         .then(user => user ? res.json(user) : res.sendStatus(404))
//         .catch(err => next(err));
// }

// function update(req, res, next) {
//     userController.update(req.params.id, req.body)
//         .then(() => res.json({}))
//         .catch(err => next(err));
// }

// routes
router.post('/authenticate', authenticate);
router.post('/register', register);
router.get('/confirmNewUser/:token', confirmNewUser);
router.post('/forgotPassword', forgotPassword);
router.get('/validateResetPasswordToken/:token', validateResetPasswordToken);
router.post('/resetPassword', resetPassword);

// Not used yet
router.get('/current', getCurrent);
// router.get('/', getAll);
// router.get('/:id', getById);
// router.put('/:id', update);

module.exports = router;
