const app = require('../app');
const request = require('supertest');
const chai = require('chai');
const expect = chai.expect;
const utils = require('./utils');

describe('##### /CLUB TESTS #####', function() {
  let testCurrentUser;  // The "currently logged in" user that will be used across all tests

  before(async () => {
    const userObj = await utils.user.create({ name: 'Ted Tester' });
    testCurrentUser = await utils.user.authenticateFake(userObj);

    console.log('testCurrentUser: ', testCurrentUser)


    
  })

  after(async () => {
    console.log('Running global after for club.test.js');
    await utils.user.deleteUser(testCurrentUser);
  });

  describe('Create a new club without a name', function() { 
    it('should return a status 400', function(done) { 
      request(app)
        .post('/clubs/create')
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + testCurrentUser.token)
        .send({})
        .end(function(err, res) {
          expect(res.statusCode).to.equal(400); 
          done(); 
        }); 
    });
  });

  describe('Correctly create a new club', function() { 
    let clubObj;

    after(async () => {
      if (clubObj) {
        await utils.club.deleteClub(clubObj)
      }
    });

    it('should return a status 200', function(done) { 
      request(app)
        .post('/clubs/create')
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + testCurrentUser.token)
        .send({ name: 'testclub__created' })
        .end(function(err, res) {
          clubObj = res.body.club;

          expect(res.statusCode).to.equal(200); 
          done(); 
        }); 
    });
  });

  describe('Correctly delete an existing club', function() { 
    let clubObj;

    before(async () => {
      clubObj = await utils.club.create({ _owner: testCurrentUser._id });
    })

    after(async () => {
      await utils.club.deleteClub(clubObj);
    })

    it('should delete the club and return a status 200', function(done) { 
      request(app)
        .delete(`/clubs/${clubObj._id}/delete`)
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + testCurrentUser.token)
        .end(async function(err, res) {
          const clubThatShouldNotExist = await utils.club.findById(clubObj);

          expect(clubThatShouldNotExist).to.equal(null)
          expect(res.statusCode).to.equal(200);
          done();
        }); 
    });
  });

  describe('Add member to club - no userId', function() { 
    let clubObj;

    before(async () => {
      clubObj = await utils.club.create({ _owner: testCurrentUser._id });
    })

    after(async () => {
      await utils.club.deleteClub(clubObj);
    })

    it('should return a status 400', function(done) { 
      request(app)
        .post(`/clubs/${clubObj._id}/addMember`)
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + testCurrentUser.token)
        .send({ _user: null })
        .end(function(err, res) {
          expect(res.statusCode).to.equal(400); 
          done(); 
        }); 
    });
  });

  describe('Add member to club - already joined', function() { 
    let clubObj;
    let userObj;

    before(async () => {
      clubObj = await utils.club.create({ _owner: testCurrentUser._id });
      userObj = await utils.user.create();

      await utils.club.addMember(userObj, clubObj);
    })

    after(async () => {
      // TODO: Run them at the same time
      await utils.club.deleteClub(clubObj);
      await utils.user.deleteUser(userObj);
    })

    it('should return a status 400', function(done) { 
      request(app)
        .post(`/clubs/${clubObj._id}/addMember`)
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + testCurrentUser.token)
        .send({ _user: userObj._id })
        .end(function(err, res) {
          expect(res.statusCode).to.equal(400); 
          done(); 
        }); 
    });
  });

  describe('Add member to club successfully', function() { 
    let userObj;
    let clubObj;

    before(async () => {
      userObj = await utils.user.create();
      clubObj = await utils.club.create({ _owner: testCurrentUser._id });
    });

    after(async () => {
      await utils.club.deleteClub(clubObj);
      await utils.user.deleteUser(userObj);
    });

    it('should return a status 200', function(done) { 
      request(app)
        .post(`/clubs/${clubObj._id}/addMember`)
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + testCurrentUser.token)
        .send({ _user: userObj._id })
        .end(function(err, res) {
          expect(res.statusCode).to.equal(200); 
          done(); 
        }); 
    });
  });
});