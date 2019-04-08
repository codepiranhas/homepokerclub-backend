const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
  type: { type: String }, // club-invite, club-member-joined, club-member-left, tournament-invite, 
  message: { type: String },

  body: {},

  _sender: { type : Schema.Types.ObjectId, ref: 'User' },
  _receiver: { type : Schema.Types.ObjectId, ref: 'User' },

  isViewed: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now },
  viewedAt: { type: Date }
});

schema.set('toJSON', { virtuals: true });

// Create the model class (mongodb collection) from the schema
const Notification = mongoose.model('Notification', schema);

// METHODS
module.exports = {
  create: (obj) => {
    let notificationDoc = new Notification(obj);

    return notificationDoc.save();
  },

  findById: (_id) => {
    return Notification.findOne({ _id });
  },

  deleteById: (_id) => {
    return Notification.deleteOne({ _id });
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
    return Notification.updateOne(
      { ...query },
      { $set: { ...args } },
      { new: true }
    );
  }

// END OF METHODS
}
