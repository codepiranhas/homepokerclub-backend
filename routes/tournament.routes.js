const express = require('express');
const router = express.Router();
const tournamentController = require('../controllers/tournament.controller');

// routes
router.post('/create', create);
router.delete('/:id/delete', deleteTournament);

module.exports = router;

function create(req, res, next) {
    tournamentController.create(req.body)
      .then(data => res.json(data))
      .catch(err => next(err));
}

function deleteTournament(req, res, next) {
  tournamentController.deleteTournament(req.params.id)
    .then(data => res.json(data))
    .catch(err => next(err));
}
