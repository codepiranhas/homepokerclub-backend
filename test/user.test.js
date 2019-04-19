const mongoose = require('mongoose');
const request = require('supertest');
const chai = require('chai');
const config = require('../config/keys');
const utils = require('./utils');
const app = require('../app');

const { expect } = chai;

/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */

describe('##### /USER TESTS #####', function () {
	before(async function () {
		if (!mongoose.connection.db) {
			await mongoose.connect(process.env.MONGODB_URI || config.mongoURI,
				{ useCreateIndex: true, useNewUrlParser: true, useFindAndModify: false });
		}
	});

	after(async function () {
		mongoose.disconnect();
	});

	describe('Register user without an email and password', function () {
		it('should return a status 400', function (done) {
			request(app)
				.post('/v1/users/register')
				.send({})
				.set('Accept', 'application/json')
				.end(function (err, res) {
					expect(res.statusCode).to.equal(400);
					done();
				});
		});
	});

	describe('Register user with an email that already exists', function () {
		let userObj;

		before(async function () {
			userObj = await utils.user.create();
		});

		after(async function () {
			await utils.user.deleteUser(userObj);
		});

		it('should return a status 400', function (done) {
			request(app)
				.post('/v1/users/register')
				.send({ email: userObj.email, password: '12345678' })
				.set('Accept', 'application/json')
				.end(function (err, res) {
					expect(res.statusCode).to.equal(400);
					done();
				});
		});
	});

	describe('Register user correctly', function () {
		let userObj;

		after(async function () {
			if (userObj) {
				await utils.user.deleteUser(userObj);
			}
		});

		it('should return status 200', function (done) {
			request(app)
				.post('/v1/users/register')
				.send({ email: `testuser_${Math.random()}_created@test.com`, password: '12345678' })
				.set('Accept', 'application/json')
				.end(function (err, res) {
					userObj = res.body;
					expect(res.statusCode).to.equal(200);
					done();
				});
		});
	});
});
