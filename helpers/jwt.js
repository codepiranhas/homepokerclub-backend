const expressJwt = require('express-jwt');
const config = require('../config/keys');
const userController = require('../controllers/user.controller');

function jwt() {
	const secret = config.secretJWT;

	async function isRevoked(req, payload, done) {
		console.log('user: ', payload.sub);
		const user = await userController.getById(payload.sub);

		console.log('user found: ', user);
		// revoke token if user no longer exists
		if (!user) {
			return done(null, true);
		}

		return done();
	}

	return expressJwt({ secret, isRevoked }).unless({
		path: [
			// public routes that don't require authentication
			// '/users/authenticate', // Can be written as a string, but can't be combined with regex
			/^\/v1\/status/,
			/^\/v1\/users\/authenticate/,
			/^\/v1\/users\/register/,
			/^\/v1\/users\/forgotPassword/,
			/^\/v1\/users\/resetPassword/,
			/^\/v1\/users\/validateResetPasswordToken\/.*/,
			/^\/v1\/users\/confirmNewUser\/.*/,

			/^\/v1\/notifications\/resolve\/.*\/.*\/.*/,
		],
	});
}

module.exports = jwt;
