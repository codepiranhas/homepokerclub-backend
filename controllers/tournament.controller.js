// const crypto = require('crypto');
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcryptjs');
const config = require('../config/keys');
const db = require('../helpers/db');
// const mailService = require('services/mail.service');
// const tokenService = require('services/token.service');
const TournamentModel = db.Tournament;

module.exports = {
		create,
		deleteTournament
};

async function create(tournamentParam) {
	console.log('tournament Param: ', tournamentParam);
	
	if (!tournamentParam || !tournamentParam.name || !tournamentParam._club) {
    throw 'Invalid parameters';
	}
	
	const savedTournament = await TournamentModel.create(tournamentParam);

  return { tournament: savedTournament };
}

async function deleteTournament(tournamentId) {
	await TournamentModel.deleteById(tournamentId);
}

