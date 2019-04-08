const app = require('../app');
const mongoose = require('mongoose');
const request = require('supertest');
const chai = require('chai');
const expect = chai.expect;
const config = require('../config/keys');
const utils = require('./utils');

describe('##### /TOURNAMENT TESTS #####', function() {
  let testCurrentUser;
  let testClub;

  before(async () => {
    if (!mongoose.connection.db) {
      console.log('Creating a new db connection')
      await mongoose.connect(process.env.MONGODB_URI || config.mongoURI, { useCreateIndex: true, useNewUrlParser: true, useFindAndModify: false })
    }
    else {
      console.log('DB connected already');
    }

    const userObj = await utils.user.create({ name: 'Ted Tester' });
    testCurrentUser = await utils.user.authenticateFake(userObj);
    testClub = await utils.club.create({ _owner: testCurrentUser._id });
  })

  after(async () => {
    // TODO: Run them at the same time
    await utils.club.deleteClub(testClub);
    await utils.user.deleteUser(testCurrentUser);
  });

  describe('Create a new tournament without a name', function() { 
    it('should return a status 400', function(done) { 
      request(app)
        .post('/tournaments/create')
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + testCurrentUser.token)
        .send({})
        .end(function(err, res) {
          expect(res.statusCode).to.equal(400); 
          done(); 
        }); 
    });
  });

  describe('Correctly create a new tournament', function() {
    let tournamentObj;

    after(async () => {
      if (tournamentObj) {
        await utils.tournament.deleteTournament(tournamentObj)
      }
    });

    it('should return a status 200', function(done) { 
      request(app)
        .post('/tournaments/create')
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + testCurrentUser.token)
        .send({ name: 'testtournament__created', _club: testClub._id })
        .end(function(err, res) {
          tournamentObj = res.body.tournament;

          expect(res.statusCode).to.equal(200); 
          done(); 
        }); 
    });
  });

  describe('Correctly delete an existing tournament', function() { 
    let tournamentObj;

    before(async () => {
      tournamentObj = await utils.tournament.create({ _club: testClub._id });
    });

    after(async () => {
      await utils.tournament.deleteTournament(tournamentObj);
    });

    it('should return a status 200', function(done) { 
      request(app)
        .delete(`/tournaments/delete/${tournamentObj._id}`)
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + testCurrentUser.token)
        .end(function(err, res) {
          expect(res.statusCode).to.equal(200); 
          done(); 
        }); 
    });
  });
});