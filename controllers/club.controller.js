// const crypto = require('crypto');
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcryptjs');
const config = require('../config/keys');
const db = require('../helpers/db');
const mailService = require('../services/mail.service');
const notificationService = require('../services/notification.service');
// const tokenService = require('services/token.service');
const ClubModel = db.Club;
const UserModel = db.User;

module.exports = {
		create,
		deleteClub,
		addMember,
		acceptInvitation
};

async function deleteClub(clubId) {
	await ClubModel.deleteById(clubId);
}

async function create(clubParam, params) {
	if (!clubParam || !clubParam.name || !params || !params._currentUser) {
    throw 'Invalid parameters @ create @ club.controller';
	}
	
	const savedClub = await ClubModel.create(clubParam, params._currentUser);
	const updatedUser = await UserModel.addClub(params._currentUser, savedClub._id);

  return { club: savedClub, user: updatedUser };
}

async function addMember(memberParam, params) {
	const { _currentUser, _currentClub } = params;

	if (!memberParam || !memberParam._user || !_currentUser || !_currentClub) {
    throw 'Invalid parameters';
	}
	
	const promises = [
		UserModel.findById(_currentUser),
		UserModel.findById(memberParam._user),
		ClubModel.findById(_currentClub)
	];

	const [inviter, invitee, club ] = await Promise.all(promises);

	if (inviter && invitee && club) {
		// Check if the invitee is already in the club
		if (club.members.some(member => member._user.toString() === memberParam._user)) {
			throw 'User already in the club or invitation pending';
		}

		// Add the new member to the club with status "pending"
		const updatedClub = await ClubModel.addMember(_currentClub, memberParam);
		// Create a notification for the member
		await notificationService.create({
			type: 'club-invitation',
			message: `${inviter.name} has invited you to join the club ${updatedClub.name}`,
			_sender: _currentUser,
			_receiver: memberParam._user,
			body: {
				_club: updatedClub._id
			}
		});
		// Send an email to the member
		await mailService.sendClubInvitation(inviter, invitee, updatedClub);

		return { club: updatedClub };
	}
	else {
		throw 'No inviter and/or invitee and/or club found @ addMember @ club.controller';
	}
}

async function acceptInvitation(params) {
	const { _currentUser, _currentClub } = params;

	if (!_currentUser || !_currentClub) {
    throw 'Invalid parameters';
	}

	const club = await ClubModel.findById(_currentClub);
	const pendingMember = club.members.find(member => member._user.toString() === _currentUser);

	if (!pendingMember) { 
		throw 'Pending member not found';
	}

	if (pendingMember.status !== 'pending') {
		throw 'Already joined';
	}

	const updatedUser = await UserModel.addClub(_currentUser, _currentClub);
	const updatedClub = await ClubModel.updateMemberStatus({ _id: _currentClub, userId: _currentUser }, { status: 'accepted' });

	return { user: updatedUser, club: updatedClub }
}