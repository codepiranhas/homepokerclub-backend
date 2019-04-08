const expressJwt = require('express-jwt');
const config = require('../config/keys');
const userController = require('../controllers/user.controller');

module.exports = jwt;

function jwt() {
    const secret = config.secretJWT;

    return expressJwt({ secret, isRevoked }).unless({
        path: [
            // public routes that don't require authentication
            // '/users/authenticate', // Can be written as a string, but then it cannot be combined with regex
            /^\/status/,
            /^\/users\/authenticate/,
            /^\/users\/register/,
            /^\/users\/forgotPassword/,
            /^\/users\/resetPassword/,
            /^\/users\/validateResetPasswordToken\/.*/,
            /^\/users\/confirmNewUser\/.*/,
        ]
    });
}

async function isRevoked(req, payload, done) {
    const user = await userController.getById(payload.sub);

    // revoke token if user no longer exists
    if (!user) {
        return done(null, true);
    }

    done();
};