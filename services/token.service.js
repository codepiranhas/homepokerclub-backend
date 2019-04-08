const crypto = require('crypto');
const db = require('../helpers/db');
const TokenModel = db.Token;

/**
 * TOKEN TYPES
 * 
 * 'new-user'         :     Generated when a new user signs up so he validates his email
 * 'reset-password'   :     Generated when a user forgot his password and tries to reset it 
 * 
 */

module.exports = {
  create,
  find
};

async function create(userId, type) {
  const token = {
    _userId: userId,
    type: type,
    token: crypto.randomBytes(16).toString('hex')
  }

  await TokenModel.create(token);

  return token;
}

async function find(token, type) {
  const tokenDoc = await TokenModel.findByTokenAndType({ token, type });

  if (tokenDoc) {
    return tokenDoc;
  }
  
  return false;
}

