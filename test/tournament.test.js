const mongoose = require('mongoose');
const request = require('supertest');
const chai = require('chai');
const config = require('../config/keys');
const utils = require('./utils');
const app = require('../app');

const { expect } = chai;

/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */

describe('##### /TOURNAMENT TESTS #####', function () {
	let testCurrentUser;
	let testClub;

	before(async function () {
		if (!mongoose.connection.db) {
			await mongoose.connect(process.env.MONGODB_URI || config.mongoURI,
				{ useCreateIndex: true, useNewUrlParser: true, useFindAndModify: false });
		}

		const userObj = await utils.user.create({ name: 'Ted Tester' });
		testCurrentUser = await utils.user.authenticateFake(userObj);
		testClub = await utils.club.create({ _owner: testCurrentUser._id });
	});

	after(async function () {
		// TODO: Run them at the same time
		await utils.club.deleteClub(testClub);
		await utils.user.deleteUser(testCurrentUser);
	});

	describe('Create a new tournament without a name', function () {
		it('should return a status 400', function (done) {
			request(app)
				.post('/v1/tournaments/create')
				.set('Accept', 'application/json')
				.set('Authorization', `Bearer ${testCurrentUser.token}`)
				.send({})
				.end(function (err, res) {
					expect(res.statusCode).to.equal(400);
					done();
				});
		});
	});

	describe('Correctly create a new tournament', function () {
		let tournamentObj;

		after(async function () {
			if (tournamentObj) {
				await utils.tournament.deleteTournament(tournamentObj);
			}
		});

		it('should return a status 200', function (done) {
			request(app)
				.post('/v1/tournaments/create')
				.set('Accept', 'application/json')
				.set('Authorization', `Bearer ${testCurrentUser.token}`)
				.send({
					name: 'testtournament__created',
					clubId: testClub._id,
					buyIn: 50,
					maxPlayers: 9,
					startingChips: 5000,
					levelDuration: 15,
					blinds: { small: 20, big: 40 },
					payoutOptions: { positions: 3, distribution: 'default' },
				})
				.end(function (err, res) {
					tournamentObj = res.body.tournament;

					expect(res.statusCode).to.equal(200);
					done();
				});
		});
	});

	describe('Correctly delete an existing tournament', function () {
		let tournamentObj;

		before(async function () {
			tournamentObj = await utils.tournament.create({
				clubId: testClub._id,
				buyIn: 50,
				maxPlayers: 9,
				startingChips: 5000,
				levelDuration: 15,
				blinds: { small: 20, big: 40 },
				payoutOptions: { positions: 3, distribution: 'default' },
			});
		});

		after(async function () {
			await utils.tournament.deleteTournament(tournamentObj);
		});

		it('should return a status 200', function (done) {
			request(app)
				.delete(`/v1/tournaments/${tournamentObj._id}/delete`)
				.set('Accept', 'application/json')
				.set('Authorization', `Bearer ${testCurrentUser.token}`)
				.end(function (err, res) {
					expect(res.statusCode).to.equal(200);
					done();
				});
		});
	});
});
