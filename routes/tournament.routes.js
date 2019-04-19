const express = require('express');
const tournamentController = require('../controllers/tournament.controller');

const router = express.Router();

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

// routes
router.post('/create', create);
router.delete('/:id/delete', deleteTournament);

module.exports = router;
