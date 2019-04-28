const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config/keys');
const db = require('../helpers/db');
const mailService = require('../services/mail.service');
const tokenService = require('../services/token.service');

const UserModel = db.User;

async function register(req, res, next) {
	const userParam = req.body;

	if (!userParam || !userParam.email || !userParam.password) {
		return next(new Error('Invalid parameters'));
	}

	if (await UserModel.findByEmail(userParam.email)) {
		return next(new Error('Email already exists.'));
	}

	const savedUser = await UserModel.create(userParam);
	const { password, ...userWithoutPassword } = savedUser.toObject();

	await mailService.sendVerifyAccount(savedUser);

	return res.status(200).json(userWithoutPassword);
}

async function authenticate(req, res, next) {
	const userParam = req.body;

	const user = await UserModel.findByEmail(userParam.email);

	if (user && bcrypt.compareSync(userParam.password, user.password)) {
		if (!user.isVerified) {
			return next(new Error('Please verify your account first.'));
		}
		const { password, ...userWithoutPassword } = user.toObject();
		const token = jwt.sign({ sub: user._id }, config.secretJWT);

		return res.status(200).json({ ...userWithoutPassword, token });
	}

	return next(new Error('Email or password is incorrect.'));
}

async function forgotPassword(req, res, next) {
	const {	email } = req.body;

	if (!email) {
		return next(new Error('Invalid parameters.'));
	}
	const user = await UserModel.findByEmail(email);

	if (user) {
		await mailService.sendResetPassword(user);
	}
	// Always return success even if no user was found
	// to prevent showing people if an email is registered
	return res.status(200).json({ message: 'success' });
}

async function validateResetPasswordToken(req, res, next) {
	const { token } = req.params;

	if (await tokenService.find(token, 'reset-password')) {
		return res.status(200).json({ message: 'success' });
	}

	return next(new Error('The request has expired. Please try again.'));
}

async function confirmNewUser(req, res, next) {
	const { token } = req.params;

	const tokenDoc = await tokenService.find(token, 'new-user');

	if (tokenDoc) {
		const updatedUser = await UserModel.updateUserToVerified(tokenDoc.userId);
		return res.status(200).json(updatedUser);
	}

	return next(new Error('Token not found'));
}

async function resetPassword(req, res, next) {
	const { password, token } = req.body;

	const tokenDoc = await tokenService.find(token, 'reset-password');

	if (!tokenDoc) {
		return next(new Error('The request has expired. Please try again.'));
	}

	const user = await UserModel.findById(tokenDoc.userId);

	if (!user) {
		return next(new Error('User not found'));
	}

	user.password = password;
	user.isVerified = true;

	await UserModel.saveUpdatedUser(user);

	return res.status(200).json({ message: 'success' });
}

async function getAll() {
	const user = await UserModel.find().select('-hash');

	return user;
}

async function getById(id) {
	const user = await UserModel.findById(id);

	return user;
}

async function update(id, userParam) {
	const user = await UserModel.findById(id);

	// validate
	if (!user) { throw new Error('User not found'); }
	if (user.username !== userParam.username
		&& await UserModel.findOne({ username: userParam.username })) {
		throw new Error(`Username ${userParam.username} is already taken`);
	}

	// hash password if it was entered
	if (userParam.password) {
		userParam.hash = bcrypt.hashSync(userParam.password, 10); // eslint-disable-line

		// copy userParam properties to user
		Object.assign(user, userParam);

		await user.save();
	}
}

async function deleteUser(userId) {
	await UserModel.deleteById(userId);
}

module.exports = {
	register,
	authenticate,
	confirmNewUser,
	forgotPassword,
	validateResetPasswordToken,
	resetPassword,
	getAll,
	getById,
	update,
	deleteUser,
};
