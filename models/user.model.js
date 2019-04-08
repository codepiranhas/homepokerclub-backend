const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

const schema = new Schema({
    email: { type: String, unique: true },
    password: { type: String },
    name: { type: String },

    clubs: [{ type : Schema.Types.ObjectId, ref: 'Club' }],

    isVerified: { type: Boolean, default: false },
    isFirstLogin: { type: Boolean, default: true },
    createdDate: { type: Date, default: Date.now }
});

schema.set('toJSON', { virtuals: true });

// On Save Hook, encrypt password
schema.pre('save', function(next) {
  const user = this;

  // Skip the hashing if password isn't changed
  if (!user.isModified('password')) { return next(); }

  bcrypt.genSalt(10, function(err, salt) {
    if (err) { return next(err); }
    bcrypt.hash(user.password, salt, function(err, hash) {
        user.password = hash;
        next();
    });
  });
});

schema.pre("update", function(next) {
  // Get all the modifed fields of the user
  const modifiedFields = this.getUpdate().$set;
  // Skip the hashing procedure if password isn't changed
  if (!modifiedFields.password) { return next(); }

  // Otherwise, rehash the new password
  bcrypt.genSalt(10, (err, salt) => {
    if (err) { return next(err); }
    bcrypt.hash(modifiedFields.password, salt, (err, hash) => {
        this.getUpdate().$set.password = hash;
        next();
    });
  });
});

// NOT USED AT THE MOMENT
// Rehash the password given and check if it's the same with the hashed passowrd saved in db
// schema.methods.comparePassword = function(candidatePassword, callback) {
//   bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
//     if (err) { return callback(err); }

//     callback(null, isMatch);
//   });
// }

const User = mongoose.model('User', schema);

// Methods exported
module.exports = {
  create: (obj) => {
    let userDoc = new User(obj);
    return userDoc.save(userDoc)
  },

  saveUpdatedUser: (user) => {
    return user.save();
  },

  findById: async (_id) => {
    return User.findOne({ _id });
  },

  findByEmail: (email) => {
    return User.findOne({ email });
  },

  deleteById: (_id) => {
    return User.deleteOne({ _id });
  },

  deleteByEmail: (email) => {
    return User.deleteOne({ email });
  },

  updateUserToVerified: (_id) => {
    return User.findOneAndUpdate(
      { _id }, 
      { $set: { isVerified: true } },
      { new: true }
    );
  },

  updateUserPasswordAndToVerified: (_id) => {
    return User.findOneAndUpdate(
      { _id }, 
      { $set: { isVerified: true } },
      { new: true }
    );
  },

  updateUserFacebookId: (args) => {
    const { _id, facebookId, facebookName } = args;

    return User.findOneAndUpdate(
      { _id }, 
      { $set: { 
        "social.facebook.id": facebookId, 
        "social.facebook.name": facebookName 
      }},
      { new: true }
    );
  },

  addClub: (_id, clubId) => {
    return User.findOneAndUpdate(
      { _id }, 
      { $push: { 
        "clubs": new mongoose.Types.ObjectId(clubId), 
      }},
      { new: true }
    );
  },

  /**
   * Universal update method
   * Parameters (args) should be passed as an object with correct property names according to the database schema.
   * @param query (object)
   * @param properties (object)
   * 
   * @example
   * updateOne({ _id: XXX, isVerified: false }, { "social.facebook.id": 'YYY', isVerified: true })
   */
  updateOne: (query, args) => {
    return User.updateOne(
      { ...query },
      { $set: { ...args } },
      { new: true }
    );
  },

  // METHODS USED FROM TESTING SUITE
  createForTest: (obj) => {
    let userDoc = new User(obj);
    return userDoc.save(userDoc)
  },

  findByIdForTest: async (_id) => {
    return User.findOne({ _id });
  },

  deleteByIdForTest: (_id) => {
    return User.deleteOne({ _id });
  },
}


// Export the model and its methods
// module.exports = { User, ...userMethods }