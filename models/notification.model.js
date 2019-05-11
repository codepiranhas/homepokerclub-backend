const mongoose = require('mongoose');

const { Schema } = mongoose;

const schema = new Schema({
	token: { type: String },
	type: { type: String }, // club-invite, club-member-joined, club-member-left, tournament-invite,
	message: { type: String },

	body: {},

	senderId: { type: Schema.Types.ObjectId, ref: 'User' },
	receiverId: { type: Schema.Types.ObjectId, ref: 'User' },
	receiverEmail: { type: String },

	isViewed: { type: Boolean, default: false },

	createdAt: { type: Date, default: Date.now },
	viewedAt: { type: Date },
});

schema.set('toJSON', { virtuals: true });

// Create the model class (mongodb collection) from the schema
const Notification = mongoose.model('Notification', schema);

// METHODS
module.exports = {
	create: (obj) => {
		const notificationDoc = new Notification(obj);

		return notificationDoc.save();
	},

	findById: _id => Notification.findOne({ _id }),

	findByToken: token => Notification.findOne({ token }),

	deleteById: _id => Notification.deleteOne({ _id }),

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
	updateOne: (query, args) => Notification.updateOne(
		{ ...query },
		{ $set: { ...args } },
		{ new: true },
	),
// END OF METHODS
};
