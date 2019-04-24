const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config/keys');
const db = require('../helpers/db');
const mailService = require('../services/mail.service');
const tokenService = require('../services/token.service');

const UserModel = db.User;

async function register(userParam) {
	if (!userParam || !userParam.email || !userParam.password) {
		throw new Error('Invalid parameters');
	}

	if (await UserModel.findByEmail(userParam.email)) {
		throw new Error('Email already exists.');
	}

	const savedUser = await UserModel.create(userParam);
	const { password, ...userWithoutPassword } = savedUser.toObject();

	await mailService.sendVerifyAccount(savedUser);

	return userWithoutPassword;
}

async function authenticate(userParam) {
	const user = await UserModel.findByEmail(userParam.email);

	if (user && bcrypt.compareSync(userParam.password, user.password)) {
		if (!user.isVerified) {
			throw new Error('Please verify your account first.');
		}
		const { password, ...userWithoutPassword } = user.toObject();
		const token = jwt.sign({ sub: user._id }, config.secretJWT);

		return { ...userWithoutPassword, token };
	}

	throw new Error('Email or password is incorrect.');
}

async function forgotPassword({ email }) {
	const user = await UserModel.findByEmail(email);

	// Fakely return success - as we should not allow the user to know our registered emails
	if (!user) { return; }

	await mailService.sendResetPassword(user);
}

async function validateResetPasswordToken(token) {
	if (await tokenService.find(token, 'reset-password')) {
		return { status: 'NOK', msg: 'token exists' };
	}

	throw new Error('The request has expired. Please try again.');
}

async function confirmNewUser(token) {
	const tokenDoc = await tokenService.find(token, 'new-user');

	if (tokenDoc) {
		const updatedUser = await UserModel.updateUserToVerified(tokenDoc.userId);
		return updatedUser;
	}

	throw new Error('Token not found');
}

async function resetPassword({ password, token }) {
	const tokenDoc = await tokenService.find(token, 'reset-password');

	if (!tokenDoc) { throw new Error('The request has expired. Please try again.'); }

	const user = await UserModel.findById(tokenDoc.userId);

	if (!user) { throw new Error('User not found'); }

	user.password = password;
	user.isVerified = true;

	await UserModel.saveUpdatedUser(user);
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
