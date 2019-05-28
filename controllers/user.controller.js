const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config/keys');
const db = require('../helpers/db');
const mailService = require('../services/mail.service');
const tokenService = require('../services/token.service');
const errorService = require('../services/error.service');

const UserModel = db.User;
const ClubModel = db.Club;

async function initializeState(req, res, next) {
	const { userId } = req.body;

	if (!userId) {
		return next(errorService.err(400, 'Invalid parameters.'));
	}

	const user = await UserModel.findById(userId);

	return res.status(200).json({ user });
}


async function register(req, res, next) {
	const userParam = req.body;

	if (!userParam || !userParam.email || !userParam.password) {
		return next(errorService.err(400, 'Invalid parameters.'));
	}

	if (await UserModel.findByEmail(userParam.email)) {
		return next(errorService.err(400, 'Email already exists.'));
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
			return next(errorService.err(400, 'Account not verified.'));
		}
		const { password, ...userWithoutPassword } = user.toObject();
		const token = jwt.sign({ sub: user._id }, config.secretJWT);

		return res.status(200).json({ ...userWithoutPassword, token });
	}

	return next(errorService.err(400, 'Email or password is incorrect'));
}

async function forgotPassword(req, res, next) {
	const {	email } = req.body;

	if (!email) {
		return next(errorService.err(400, 'Invalid parameters'));
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

	return next(errorService.err(400, 'Token expired. Please try again.'));
}

async function confirmNewUser(req, res, next) {
	const { token } = req.params;

	const tokenDoc = await tokenService.find(token, 'new-user');

	if (tokenDoc) {
		// Initialize the user by creating a club for him
		const clubObj = {
			name: 'My awesome club',
			ownerId: tokenDoc.userId,
		};

		// Create the club
		const club = await ClubModel.create(clubObj, tokenDoc.userId);

		// Add the club to the user and update him to verified
		await UserModel.updateOne(
			{ _id: tokenDoc.userId },
			{ clubs: [club._id], isVerified: true },
		);

		return res.redirect(config.frontendUrl);
	}

	return next(errorService.err(400, 'Token not found.'));
}

async function resetPassword(req, res, next) {
	const { password, token } = req.body;

	const tokenDoc = await tokenService.find(token, 'reset-password');

	if (!tokenDoc) {
		return next(errorService.err(400, 'The request has expired. Please try again.'));
	}

	const user = await UserModel.findById(tokenDoc.userId);

	if (!user) {
		return next(errorService.err(400, 'User not found.'));
	}

	user.password = password;
	user.isVerified = true;

	await UserModel.saveUpdatedUser(user);

	return res.status(200).json({ message: 'success' });
}

async function changePassword(req, res, next) {
	const { oldPassword, newPassword } = req.body;
	const currentUserId = req.user.sub;

	if (!currentUserId || !oldPassword || !newPassword || newPassword.length < 6) {
		return next(errorService.err(400, 'Invalid Parameters'));
	}

	const user = await UserModel.findById(currentUserId);

	if (!user) {
		return next(errorService.err(400, 'User not found.'));
	}

	if (!bcrypt.compareSync(oldPassword, user.password)) {
		return next(errorService.err(400, 'Wrong old password'));
	}

	user.password = newPassword;

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

async function update(req, res, next) {
	const { id } = req.params.id;
	const userParam = req.body;
	const user = await UserModel.findById(id);

	// validate
	if (!user) {
		return next(errorService.err(400, 'User not found.'));
	}

	if (user.username !== userParam.username
	&& await UserModel.findOne({ username: userParam.username })) {
		return next(errorService.err(400, `Username ${userParam.username} is already taken`));
	}

	// hash password if it was entered
	if (userParam.password) {
		userParam.hash = bcrypt.hashSync(userParam.password, 10); // eslint-disable-line

		// copy userParam properties to user
		Object.assign(user, userParam);

		await user.save();

		return res.status(200).json({ message: 'success' });
	}
	return res.status(200).json({ message: 'success' });
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
	changePassword,
	getAll,
	getById,
	update,
	deleteUser,
	initializeState,
};
