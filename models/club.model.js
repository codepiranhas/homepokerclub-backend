const mongoose = require('mongoose');

const { Schema } = mongoose;

const schema = new Schema({
	name: { type: String, required: true },

	ownerId: { type: Schema.Types.ObjectId, ref: 'User' },

	members: [{
		name: { type: String, required: true },
		status: { type: String }, // active, pending
		email: { type: String },
		level: { type: String }, // member, admin
		imageUrl: { type: String },
		isRemoved: { type: Boolean, default: false },

		createdAt: { type: Date, default: Date.now },
		removedAt: { type: Date },
	}],

	createdAt: { type: Date, default: Date.now },
});

schema.set('toJSON', { virtuals: true });

// Create the model class (mongodb collection) from the schema
const Club = mongoose.model('Club', schema);

// METHODS
module.exports = {
	create: (obj) => {
		const clubDoc = new Club(obj);

		return clubDoc.save();
	},

	findById: _id => Club.findOne({ _id }),

	findByIds: ids => Club.find({ _id: { $in: ids } }),

	deleteById: _id => Club.deleteOne({ _id }),

	addMember: (_id, member) => {
		const memberDoc = {
			name: member.name,
			email: member.email || undefined,
			status: member.status || 'active',
			level: member.level || 'member',
			imageUrl: member.imageUrl || undefined,
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

	removeMember: (_id, memberId) => Club.findOneAndUpdate(
		{ _id },
		{
			$pull: {
				members: { _id: memberId },
			},
		},
		{ new: true },
	),

	markMemberAsRemoved: (_id, memberId) => Club.findOneAndUpdate(
		{ _id, 'members._id': memberId }, // For multiple: members: { $elemMatch: { grade: { $lte: 90 }, mean: { $gt: 80 } } }
		{
			$set: {
				'members.$.isRemoved': true,
				'members.$.removedAt': Date.now(),
			},
		},
		{ new: true },
	),

	updateMemberDetails: (query, args) => Club.findOneAndUpdate(
		{ _id: query._id, 'members._id': query.memberId }, // For multiple: members: { $elemMatch: { grade: { $lte: 90 }, mean: { $gt: 80 } } }
		{
			$set: {
				'members.$.name': args.name,
				'members.$.email': args.email,
				'members.$.imageUrl': args.imageUrl || undefined,
			},
		},
		{ new: true },
	),

	findMember: query => Club.findOne(
		{ _id: query._id, 'members._id': query.memberId }, // For multiple: members: { $elemMatch: { grade: { $lte: 90 }, mean: { $gt: 80 } } }
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
