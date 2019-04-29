// const crypto = require('crypto');
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcryptjs');
// const config = require('../config/keys');

const db = require('../helpers/db');
// const mailService = require('services/mail.service');
// const tokenService = require('services/token.service');
const TournamentModel = db.Tournament;

async function create(req, res, next) {
	const tournamentParam = req.body;

	if (!tournamentParam || !tournamentParam.name || !tournamentParam.clubId) {
		return next(Error('Invalid parameters'));
	}

	const savedTournament = await TournamentModel.create(tournamentParam);

	return res.status(200).json({ tournament: savedTournament });
}

async function deleteTournament(req, res, next) {
	const tournamentId = req.params.id;

	if (!tournamentId) {
		return next(Error('Invalid parameters'));
	}

	await TournamentModel.deleteById(tournamentId);

	return res.status(200).json({ message: 'success' });
}

module.exports = {
	create,
	deleteTournament,
};
