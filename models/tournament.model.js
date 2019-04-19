const mongoose = require('mongoose');

const {	Schema } = mongoose;

const schema = new Schema({
	name: { type: String, required: true },

	clubId: { type: Schema.Types.ObjectId, ref: 'Club' },

	players: [{ type: Schema.Types.ObjectId, ref: 'User' }],

	createdAt: { type: Date, default: Date.now },
});

schema.set('toJSON', { virtuals: true });

// Create the model class (mongodb collection) from the schema
const Tournament = mongoose.model('Tournament', schema);

// METHODS
module.exports = {
	create: (obj) => {
		const tournamentDoc = new Tournament(obj);

		return tournamentDoc.save();
	},

	findById: _id => Tournament.findOne({ _id }),

	deleteById: _id => Tournament.deleteOne({ _id }),

	// METHODS USED FROM TESTING SUITE
	createForTest: (obj) => {
		const tournamentDoc = new Tournament(obj);

		return tournamentDoc.save();
	},

	// METHODS USED FROM TESTING SUITE
	deleteByIdForTest: _id => Tournament.deleteOne({ _id }),
};
