const errorService = require('../services/error.service');
const db = require('../helpers/db');

const TournamentModel = db.Tournament;

async function create(req, res, next) {
	const tournamentParam = req.body;

	if (!tournamentParam || !tournamentParam.name || !tournamentParam.clubId) {
		return next(errorService.err(400, 'Invalid parameters.'));
	}

	const savedTournament = await TournamentModel.create(tournamentParam);

	return res.status(200).json({ tournament: savedTournament });
}

async function deleteTournament(req, res, next) {
	const tournamentId = req.params.id;

	if (!tournamentId) {
		return next(errorService.err(400, 'Invalid parameters.'));
	}

	await TournamentModel.deleteById(tournamentId);

	return res.status(200).json({ message: 'success' });
}

module.exports = {
	create,
	deleteTournament,
};
