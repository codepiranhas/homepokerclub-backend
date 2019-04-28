const express = require('express');
const tournamentController = require('../controllers/tournament.controller');

const router = express.Router();

// routes
router.post('/create', tournamentController.create);
router.delete('/:id/delete', tournamentController.deleteTournament);

module.exports = router;
