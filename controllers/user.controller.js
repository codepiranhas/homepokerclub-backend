const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config/keys');
const db = require('../helpers/db');
const mailService = require('../services/mail.service');
const tokenService = require('../services/token.service');
const UserModel = db.User;

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
    deleteUser
};

async function register(userParam) {
  if (!userParam || !userParam.email || !userParam.password) {
    throw 'Invalid parameters';
  }

  if (await UserModel.findByEmail(userParam.email)) {
    throw 'Email already exists.';
  }

  const savedUser = await UserModel.create(userParam);
  const { password, ...userWithoutPassword } = savedUser.toObject();

  await mailService.sendVerifyAccount(savedUser);

  return userWithoutPassword;
}

async function authenticate({ email, password }) {
  const user = await UserModel.findByEmail(email);

  if (user && bcrypt.compareSync(password, user.password)) {
    const { password, ...userWithoutPassword } = user.toObject();
    const token = jwt.sign({ sub: user._id }, config.secretJWT);

    return { ...userWithoutPassword, token };
  }
  else { 
    throw 'Email or password is incorrect'; }
}

async function forgotPassword({ email }) {
  const user = await UserModel.findByEmail(email);

  // Fakely return success - as we should not allow the user to know our registered emails
  if (!user) { return; }

  await mailService.sendResetPassword(user);
}

async function validateResetPasswordToken(token) {
  if (await tokenService.find(token, 'reset-password')) {
    return { status: "OK", msg: "token exists" };
  }

  throw 'The request has expired. Please try again.';
}

async function confirmNewUser(token) {
  const tokenDoc = await tokenService.find(token, 'new-user' );

  if (tokenDoc) {
    return await UserModel.updateUserToVerified(tokenDoc._userId);
  }
  
  throw 'Token not found';
}

async function resetPassword({ password, token }) {
  const tokenDoc = await tokenService.find(token, 'reset-password');
    
  if (!tokenDoc) { throw 'The request has expired. Please try again.'; };

  const user = await UserModel.findById(tokenDoc._userId);

  if (!user) { throw 'User not found'; }

  user.password = password;
  user.isVerified = true;

  await UserModel.saveUpdatedUser(user);
}

async function getAll() {
  // return await User.find().select('-hash');
}

async function getById(id) {
  return await UserModel.findById(id);
}

async function update(id, userParam) {
  const user = await User.findById(id);
  
  // validate
  if (!user) throw 'User not found';
  if (user.username !== userParam.username && await User.findOne({ username: userParam.username })) {
    throw 'Username "' + userParam.username + '" is already taken';
  }

  // hash password if it was entered
  if (userParam.password) {
    userParam.hash = bcrypt.hashSync(userParam.password, 10);
  }

  // copy userParam properties to user
  Object.assign(user, userParam);

  await user.save();
}

async function deleteUser(userId) {
  await UserModel.deleteById(userId);
}