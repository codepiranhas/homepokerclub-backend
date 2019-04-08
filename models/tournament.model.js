const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
  name: { type: String, required: true },

  _club: { type : Schema.Types.ObjectId, ref: 'Club' },

  players: [{ type : Schema.Types.ObjectId, ref: 'User' }],

  createdAt: { type: Date, default: Date.now, }
});

schema.set('toJSON', { virtuals: true });

// Create the model class (mongodb collection) from the schema
const Tournament = mongoose.model('Tournament', schema);

// METHODS
module.exports = {
  create: (obj) => {
    let tournamentDoc = new Tournament(obj);

    return tournamentDoc.save();
  },

  findById: (_id) => {
    return Tournament.findOne({ _id });
  },

  deleteById: (_id) => {
    return Tournament.deleteOne({ _id });
  },

  // METHODS USED FROM TESTING SUITE
  createForTest: (obj) => {
    let tournamentDoc = new Tournament(obj);

    return tournamentDoc.save();
  },

  deleteByIdForTest: (_id) => {
    return Tournament.deleteOne({ _id });
  },
}
