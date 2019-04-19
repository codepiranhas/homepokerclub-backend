const request = require('supertest');
const chai = require('chai');
const utils = require('./utils');
const app = require('../app');

const { expect } = chai;

/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */

describe('##### /CLUB TESTS #####', function () {
	let currentUser; // The "currently logged in" user that will be used across all tests

	before(async function () {
		const userObj = await utils.user.create({ name: 'Ted Tester' });
		currentUser = await utils.user.authenticateFake(userObj);
	});

	after(async function () {
		await utils.user.deleteUser(currentUser);
	});

	describe('Create a new club without a name', function () {
		it('should return a status 400', function (done) {
			request(app)
				.post('/clubs/create')
				.set('Accept', 'application/json')
				.set('Authorization', `Bearer ${currentUser.token}`)
				.send({})
				.end(function (err, res) {
					expect(res.statusCode).to.equal(400);
					done();
				});
		});
	});

	describe('Correctly create a new club', function () {
		let clubObj;

		after(async function () {
			if (clubObj) {
				await utils.club.deleteClub(clubObj);
			}
		});

		it('should return a status 200', function (done) {
			request(app)
				.post('/clubs/create')
				.set('Accept', 'application/json')
				.set('Authorization', `Bearer ${currentUser.token}`)
				.send({ name: 'testclub__created' })
				.end(function (err, res) {
					clubObj = res.body.club;

					expect(res.statusCode).to.equal(200);
					done();
				});
		});
	});

	describe('Correctly delete an existing club', function () {
		let clubObj;

		before(async function () {
			clubObj = await utils.club.create({ ownerId: currentUser._id });
		});

		after(async function () {
			await utils.club.deleteClub(clubObj);
		});

		it('should delete the club and return a status 200', function (done) {
			request(app)
				.delete(`/clubs/${clubObj._id}/delete`)
				.set('Accept', 'application/json')
				.set('Authorization', `Bearer ${currentUser.token}`)
				.end(async function (err, res) {
					const clubThatShouldNotExist = await utils.club.findById(clubObj);

					expect(clubThatShouldNotExist).to.equal(null);
					expect(res.statusCode).to.equal(200);
					done();
				});
		});
	});

	describe('Add member to club - no userId', function () {
		let clubObj;

		before(async function () {
			clubObj = await utils.club.create({ ownerId: currentUser._id });
		});

		after(async function () {
			await utils.club.deleteClub(clubObj);
		});

		it('should return a status 400', function (done) {
			request(app)
				.post(`/clubs/${clubObj._id}/addMember`)
				.set('Accept', 'application/json')
				.set('Authorization', `Bearer ${currentUser.token}`)
				.send({ userId: null })
				.end((err, res) => {
					expect(res.statusCode).to.equal(400);
					done();
				});
		});
	});

	describe('Add member to club - already joined', function () {
		let clubObj;
		let userObj;

		before(async function () {
			clubObj = await utils.club.create({ ownerId: currentUser._id });
			userObj = await utils.user.create();

			await utils.club.addMember(userObj, clubObj);
		});

		after(async function () {
			// TODO: Run them at the same time
			await utils.club.deleteClub(clubObj);
			await utils.user.deleteUser(userObj);
		});

		it('should return a status 400', function (done) {
			request(app)
				.post(`/clubs/${clubObj._id}/addMember`)
				.set('Accept', 'application/json')
				.set('Authorization', `Bearer ${currentUser.token}`)
				.send({ userId: userObj._id })
				.end(function (err, res) {
					expect(res.statusCode).to.equal(400);
					done();
				});
		});
	});

	describe('Add member to club successfully', function () {
		let userObj;
		let clubObj;

		before(async function () {
			userObj = await utils.user.create();
			clubObj = await utils.club.create({ ownerId: currentUser._id });
		});

		after(async function () {
			await utils.club.deleteClub(clubObj);
			await utils.user.deleteUser(userObj);
		});

		it('should return a status 200', function (done) {
			request(app)
				.post(`/clubs/${clubObj._id}/addMember`)
				.set('Accept', 'application/json')
				.set('Authorization', `Bearer ${currentUser.token}`)
				.send({ userId: userObj._id })
				.end(function (err, res) {
					expect(res.statusCode).to.equal(200);
					done();
				});
		});
	});
});
