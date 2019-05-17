const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const { Schema } = mongoose;

const schema = new Schema({
	email: { type: String, unique: true },
	password: { type: String },
	name: { type: String },

	clubs: [{ type: Schema.Types.ObjectId, ref: 'Club' }],
	lastViewedClub: { type: Schema.Types.ObjectId, ref: 'Club' },

	isVerified: { type: Boolean, default: false },
	isFirstLogin: { type: Boolean, default: true },
	createdDate: { type: Date, default: Date.now },
});

schema.set('toJSON', { virtuals: true });

// On Save Hook, encrypt password
schema.pre('save', function beforeSave(next) {
	const user = this;
	// Skip the hashing if password isn't changed
	if (!user.isModified('password')) { return next(); }

	return bcrypt.genSalt(10, (error1, salt) => {
		if (error1) { return next(error1); }

		return bcrypt.hash(user.password, salt, (error2, hash) => {
			if (error2) { return next(error2); }

			user.password = hash;
			return next();
		});
	});
});

schema.pre('update', function beforeUpdate(next) {
	// Get all the modifed fields of the user
	const modifiedFields = this.getUpdate().$set;
	// Skip the hashing procedure if password isn't changed
	if (!modifiedFields.password) { return next(); }

	// Otherwise, rehash the new password
	return bcrypt.genSalt(10, (error1, salt) => {
		if (error1) { return next(error1); }

		return bcrypt.hash(modifiedFields.password, salt, (error2, hash) => {
			if (error2) { return next(error2); }

			this.getUpdate().$set.password = hash;
			return next();
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
		const userDoc = new User(obj);

		return userDoc.save(userDoc);
	},

	saveUpdatedUser: user => user.save(),

	findById: async _id => User.findOne({ _id }).populate('clubs'),

	findByEmail: email => User.findOne({ email }).populate('clubs'),

	deleteById: _id => User.deleteOne({ _id }),

	deleteByEmail: email => User.deleteOne({ email }),

	updateUserToVerified: _id => User.findOneAndUpdate(
		{ _id },
		{
			$set: { isVerified: true },
		},
		{ new: true },
	),

	updateUserPasswordAndToVerified: _id => User.findOneAndUpdate(
		{ _id },
		{
			$set: { isVerified: true },
		},
		{ new: true },
	),

	updateUserFacebookId: (args) => {
		const { _id, facebookId, facebookName } = args;

		return User.findOneAndUpdate(
			{ _id },
			{
				$set: {
					'social.facebook.id': facebookId,
					'social.facebook.name': facebookName,
				},
			},
			{ new: true },
		);
	},

	addClub: (_id, clubId) => User.findOneAndUpdate(
		{ _id },
		{
			$push: { clubs: new mongoose.Types.ObjectId(clubId) },
		},
		{ new: true },
	),

	/**
	 * Universal update method
	 * Parameters (args) should be passed as an object
	 * with correct property names according to the database schema.
	 * @param query (object)
	 * @param properties (object)
	 *
	 * @example
	 * updateOne({ _id: XXX, isVerified: false }, { "social.facebook.id": 'YYY', isVerified: true })
	 */
	updateOne: (query, args) => User.updateOne(
		{ ...query },
		{
			$set: { ...args },
		},
		{ new: true },
	),

	// METHODS USED FROM TESTING SUITE
	createForTest: (obj) => {
		const userDoc = new User(obj);
		return userDoc.save(userDoc);
	},

	findByIdForTest: _id => User.findOne({ _id }),

	deleteByIdForTest: _id => User.deleteOne({ _id }),
};
