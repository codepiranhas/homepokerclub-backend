const express = require('express');
const router = express.Router();
const clubController = require('../controllers/club.controller');

// routes
router.post('/create', create);

router.delete('/:id/delete', deleteClub);
router.post('/:id/addMember', addMember);

router.patch('/:id/acceptInvitation', acceptInvitation);
router.patch('/:id/declineInvitation', declineInvitation);

module.exports = router;

function create(req, res, next) {
    clubController.create(req.body, { _currentUser: req.user.sub })
      .then(data => res.json(data))
      .catch(err => next(err));
}

function addMember(req, res, next) {
  clubController.addMember(req.body, { _currentUser: req.user.sub, _currentClub: req.params.id })
    .then(data => res.json(data))
    .catch(err => next(err));
}

function deleteClub(req, res, next) {
  clubController.deleteClub(req.params.id)
    .then(data => res.json(data))
    .catch(err => next(err));
}

function acceptInvitation(req, res, next) {
  clubController.acceptInvitation({ _currentUser: req.user.sub, _currentClub: req.params.id })
    .then(data => res.json(data))
    .catch(err => next(err));
}

function declineInvitation(req, res, next) {
  clubController.declineInvitation({ _currentUser: req.user.sub, _currentClub: req.params.id })
    .then(data => res.json(data))
    .catch(err => next(err));
}
