const mongoose = require('mongoose');

const { Schema } = mongoose;

const schema = new Schema({
	name: { type: String, required: true },

	ownerId: { type: Schema.Types.ObjectId, ref: 'User' },

	members: [{
		userId: { type: Schema.Types.ObjectId, ref: 'User' },
		status: { type: String }, // accepted, pending
		level: { type: String }, // member, admin
		joinedAt: { type: Date, default: Date.now },
	}],

	createdAt: { type: Date, default: Date.now },
});

schema.set('toJSON', { virtuals: true });

// Create the model class (mongodb collection) from the schema
const Club = mongoose.model('Club', schema);

// METHODS
module.exports = {
	create: (obj, userId) => {
		const clubDoc = new Club(obj);

		clubDoc.ownerId = new mongoose.Types.ObjectId(userId);
		clubDoc.members = [{
			userId: new mongoose.Types.ObjectId(userId),
			status: 'accepted',
			level: 'owner',
		}];

		return clubDoc.save();
	},

	findById: _id => Club.findOne({ _id }),

	deleteById: _id => Club.deleteOne({ _id }),

	addMember: (_id, member) => {
		const memberDoc = {
			userId: mongoose.Types.ObjectId(member.userId),
			status: member.status || 'pending',
			level: member.level || 'member',
		};

		return Club.findOneAndUpdate(
			{ _id },
			{
				$push: {
					members: memberDoc,
				},
			},
			{ new: true },
		);
	},

	updateMemberStatus: (query, args) => Club.findOneAndUpdate(
		{ _id: query._id, 'members.userId': query.userId },
		{
			$set: {
				'members.$.status': args.status,
			},
		},
		{ new: true },
	),

	updateMemberLevel: (query, args) => Club.findOneAndUpdate(
		{ _id: query._id, 'members.userId': query.userId }, // For multiple: members: { $elemMatch: { grade: { $lte: 90 }, mean: { $gt: 80 } } }
		{
			$set: {
				'members.$.level': args.level,
			},
		},
		{ new: true },
	),

	// METHODS USED FROM TESTING SUITE
	createForTest: (obj) => {
		const clubDoc = new Club(obj);

		return clubDoc.save();
	},

	findByIdForTest: _id => Club.findOne({ _id }),

	deleteByIdForTest: _id => Club.deleteOne({ _id }),

	addMemberForTest: (_id, member) => Club.findOneAndUpdate(
		{ _id },
		{
			$push: {
				members: member,
			},
		},
		{ new: true },
	),
};
