const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
  name: { type: String, required: true },

  _owner: { type : Schema.Types.ObjectId, ref: 'User' },

  members: [{
    _user: { type: Schema.Types.ObjectId, ref: 'User' },
    status: { type: String }, // accepted, pending
    level: { type: String },   // member, admin
    joinedAt: { type: Date, default: Date.now, }
  }],

  createdAt: { type: Date, default: Date.now, }
});

schema.set('toJSON', { virtuals: true });

// Create the model class (mongodb collection) from the schema
const Club = mongoose.model('Club', schema);

// METHODS
module.exports = {
  create: (obj, userId) => {
    let clubDoc = new Club(obj);

    clubDoc._owner = new mongoose.Types.ObjectId(userId);
    clubDoc.members = [{ 
      _user: new mongoose.Types.ObjectId(userId),
      status: 'accepted',
      level: 'owner'
    }];

    return clubDoc.save();
  },

  findById: (_id) => {
    return Club.findOne({ _id });
  },

  deleteById: (_id) => {
    return Club.deleteOne({ _id });
  },

  addMember: (_id, member) => {
    const memberDoc = {
      _user: mongoose.Types.ObjectId(member._user),
      status: member.status || 'pending',
      level: member.level || 'member'
    }

    return Club.findOneAndUpdate(
      { _id }, 
      { $push: { 
        "members": memberDoc
      }},
      { new: true }
    );
  },

  updateMemberStatus: (query, args) => {
    return Club.findOneAndUpdate(
      { _id: query._id, "members._user": query.userId }, 
      { $set: { 
        "members.$.status": args.status
      }},
      { new: true }
    );
  },

  updateMemberLevel: (query, args) => {
    return Club.findOneAndUpdate(
      { _id: query._id, "members._user": query._userId }, // For multiple: members: { $elemMatch: { grade: { $lte: 90 }, mean: { $gt: 80 } } }
      { $set: { 
        "members.$.level": args.level
      }},
      { new: true }
    );
  },



  // METHODS USED FROM TESTING SUITE
  createForTest: (obj) => {
    let clubDoc = new Club(obj);

    return clubDoc.save();
  },

  findByIdForTest: (_id) => {
    return Club.findOne({ _id });
  },

  deleteByIdForTest: (_id) => {
    return Club.deleteOne({ _id });
  },

  addMemberForTest: (_id, member) => {
    return Club.findOneAndUpdate(
      { _id }, 
      { $push: { 
        "members": member
      }},
      { new: true }
    );
  },
}