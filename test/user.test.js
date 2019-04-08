const app = require('../app');
const mongoose = require('mongoose');
const request = require('supertest');
const chai = require('chai');
const expect = chai.expect;
const config = require('../config/keys');
const utils = require('./utils');

describe('##### /USER TESTS #####', function() {
  before(async () => {
    if (!mongoose.connection.db) {
      console.log('Creating a new db connection')
      await mongoose.connect(process.env.MONGODB_URI || config.mongoURI, { useCreateIndex: true, useNewUrlParser: true, useFindAndModify: false })
    }
    else {
      console.log('DB connected already');
    }
  });

  after(async () => {
    console.log('Running global after for user.test.js');
    mongoose.disconnect();
  });

  describe('Register user without an email and password', function() {
    it('should return a status 400', function(done) { 
      request(app)
        .post('/users/register')
        .send({})
        .set('Accept', 'application/json')
        .end(function(err, res) {
          expect(res.statusCode).to.equal(400); 
          done(); 
        }); 
    });
  });

  describe('Register user with an email that already exists', function() { 
    let userObj;

    before(async () => {
      userObj = await utils.user.create();
    });

    after(async () => {
      await utils.user.deleteUser(userObj);
    });

    it('should return a status 400', function(done) { 
      request(app)
        .post('/users/register')
        .send({email: userObj.email, password: '12345678'})
        .set('Accept', 'application/json')
        .end(function(err, res) {
          expect(res.statusCode).to.equal(400); 
          done(); 
        }); 
    });
  });

  describe('Register user correctly', function() {
    let userObj;

    after(async () => {
      if (userObj) {
        await utils.user.deleteUser(userObj);
      }
    });

    it('should return status 200', function(done) { 
      request(app)
        .post('/users/register')
        .send({email: `testuser_${Math.random()}_created@test.com`, password: '12345678'})
        .set('Accept', 'application/json')
        .end(function(err, res) {
          userObj = res.body;
          expect(res.statusCode).to.equal(200); 
          done(); 
        }); 
    });
  });
});