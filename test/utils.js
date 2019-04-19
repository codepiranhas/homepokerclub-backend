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
			const user = await UserModel.findByIdForTest(userObj._id);

			return user;
		},

		authenticateFake: async (userObj) => {
			const token = jwt.sign({ sub: userObj._id }, config.secretJWT);

			return { ...userObj, token };
		},

		deleteUser: async (user) => {
			const res = UserModel.deleteByIdForTest(user._id);

			return res;
		},
	},

	club: {
		create: async (clubObj) => {
			const club = { ...clubObj };

			if (!club.name) {
				club.name = `testClub_${randomGenerators.randomStringOfLength(3)}_toBeDeleted`;
			}

			const clubCreated = await ClubModel.createForTest(club);

			return clubCreated;
		},

		findById: async (clubObj) => {
			const club = await ClubModel.findByIdForTest(clubObj._id);

			return club;
		},

		deleteClub: async (club) => {
			const res = await ClubModel.deleteByIdForTest(club._id);

			return res;
		},

		addMember: async (user, club) => {
			const member = { userId: user._id };
			const clubUpdated = await ClubModel.addMemberForTest(club._id, member);

			return clubUpdated;
		},
	},

	tournament: {
		create: async (tournamentObj) => {
			const tournament = { ...tournamentObj };

			if (!tournament.name) {
				tournament.name = `testTournament_${randomGenerators.randomStringOfLength(3)}_toBeDeleted`;
			}

			const tournamentCreated = await TournamentModel.createForTest(tournament);

			return tournamentCreated;
		},

		deleteTournament: async (tournament) => {
			const res = await TournamentModel.deleteByIdForTest(tournament._id);

			return res;
		},
	},
};
