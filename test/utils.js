const jwt = require('jsonwebtoken');
const config = require('../config/keys');
const randomGenerators = require('../helpers/randomGenerators');

const UserModel = require('../models/user.model');
const ClubModel = require('../models/club.model');
const TournamentModel = require('../models/tournament.model');
module.exports = {
  user: {
    create: async (userObj) => {
      const user = { ...userObj };

      if (!user.email) { user.email = `testuser_${randomGenerators.uuid()}@test.com`; }
      if (!user.password) { user.password = '12345678'; }

      const savedUser = await UserModel.createForTest(user);

      const { password, ...userWithoutPassword } = savedUser.toObject();
      
      return userWithoutPassword;
    },

    findById: async (userObj) => {
      return await UserModel.findByIdForTest(userObj._id);
    },

    authenticateFake: async (userObj) => {
      const token = jwt.sign({ sub: userObj._id }, config.secretJWT);
  
      return { ...userObj, token };
    },

    deleteUser: async (user) => {
      return await UserModel.deleteByIdForTest(user._id);
    },
  },

  club: {
    create: async (clubObj) => {
      const club = { ...clubObj }
      if (!club.name) {
        club.name = `testClub_${randomGenerators.randomStringOfLength(3)}_toBeDeleted`;
      }

      return await ClubModel.createForTest(club);  
    },

    findById: async (clubObj) => {
      return await ClubModel.findByIdForTest(clubObj._id);
    },

    deleteClub: async (club) => {
      return await ClubModel.deleteByIdForTest(club._id);
    },

    addMember: async (user, club) => {
      const member = { _user: user._id }

      return await ClubModel.addMemberForTest(club._id, member);
    }
  },

  tournament: {
    create: async (tournamentObj) => {
      const tournament = { ...tournamentObj }
      if (!tournament.name) {
        tournament.name = `testTournament_${randomGenerators.randomStringOfLength(3)}_toBeDeleted`;
      }

      return await TournamentModel.createForTest(tournament);  
    },

    deleteTournament: async (tournament) => {
      return await TournamentModel.deleteByIdForTest(tournament._id);
    },
  }

}