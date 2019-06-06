const mongoose = require('mongoose');

const {	Schema } = mongoose;

const schema = new Schema({
	name: { type: String, required: true },

	buyIn: { type: Number, required: true },
	maxPlayers: { type: Number, required: true },
	startingChips: { type: Number, required: true },
	levelDuration: { type: Number, required: true },	// TODO: Make sure the correct type is chosen

	blinds: {
		small: { type: Number, required: true },
		big: { type: Number, required: true },
	},

	payoutOptions: {
		positions: { type: Number, require: true },
		distribution: { type: String, require: true },	// Between: ['default', 'evenly']
	},

	clubId: { type: Schema.Types.ObjectId, ref: 'Club' },

	players: [{ type: Schema.Types.ObjectId, ref: 'User' }],

	createdAt: { type: Date, default: Date.now },
	startsAt: { type: Date },
	finishedAt: { type: Date },
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

	findAllByClubId: clubId => Tournament.find({ clubId }),

	deleteById: _id => Tournament.deleteOne({ _id }),

	// METHODS USED FROM TESTING SUITE
	createForTest: (obj) => {
		const tournamentDoc = new Tournament(obj);

		return tournamentDoc.save();
	},

	deleteByIdForTest: _id => Tournament.deleteOne({ _id }),
};
