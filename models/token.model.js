const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
  _userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },

  token: {
    type: String,
    required: true
  },

  type: {
    type: String,
    required: true
  },

  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
    expires: 36000
  } 
});

schema.set('toJSON', { virtuals: true });

// Create the model class (mongodb collection) from the schema
const Token = mongoose.model('Token', schema);

// METHODS

module.exports = {
  create: (obj) => {
    let tokenDoc = new Token(obj);
    return tokenDoc.save();
  },

  findById: (_id) => {
    return Token.findOne({ _id });
  },

  findByTokenAndType: (args) => {
    const { token, type } = args;

    return Token.findOne({ token, type });
  },

  deleteById: (_id) => {
    return Token.deleteOne({ _id });
  }
// END OF METHODS
}
