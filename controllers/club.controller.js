// const crypto = require('crypto');
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcryptjs');
// const config = require('../config/keys');
const db = require('../helpers/db');
const mailService = require('../services/mail.service');
const notificationService = require('../services/notification.service');
// const tokenService = require('services/token.service');
const ClubModel = db.Club;
const UserModel = db.User;

async function deleteClub(clubId) {
	await ClubModel.deleteById(clubId);
}

async function create(clubParam, params) {
	if (!clubParam || !clubParam.name || !params || !params.currentUserId) {
		throw new Error('Invalid parameters @ create @ club.controller');
	}

	const savedClub = await ClubModel.create(clubParam, params.currentUserId);
	const updatedUser = await UserModel.addClub(params.currentUserId, savedClub._id);

	return { club: savedClub, user: updatedUser };
}

async function addMember(memberParam, params) {
	const { currentUserId, currentClubId } = params;

	if (!memberParam || !memberParam.userId || !currentUserId || !currentClubId) {
		throw new Error('Invalid parameters');
	}

	const promises = [
		UserModel.findById(currentUserId),
		UserModel.findById(memberParam.userId),
		ClubModel.findById(currentClubId),
	];

	const [inviter, invitee, club] = await Promise.all(promises);

	if (inviter && invitee && club) {
		// Check if the invitee is already in the club
		if (club.members.some(member => member.userId.toString() === memberParam.userId)) {
			throw new Error('User already in the club or invitation pending');
		}

		// Add the new member to the club with status "pending"
		const updatedClub = await ClubModel.addMember(currentClubId, memberParam);
		// Create a notification for the member
		await notificationService.create({
			type: 'club-invitation',
			message: `${inviter.name} has invited you to join the club ${updatedClub.name}`,
			senderId: currentUserId,
			receiverId: memberParam.userId,
			body: {
				clubId: updatedClub._id,
			},
		});
		// Send an email to the member
		await mailService.sendClubInvitation(inviter, invitee, updatedClub);

		return { club: updatedClub };
	}

	throw new Error('No inviter and/or invitee and/or club found @ addMember @ club.controller');
}

async function acceptInvitation(params) {
	const { currentUserId, currentClubId } = params;

	if (!currentUserId || !currentClubId) {
		throw new Error('Invalid parameters');
	}

	const club = await ClubModel.findById(currentClubId);
	const pendingMember = club.members.find(member => member.userId.toString() === currentUserId);

	if (!pendingMember) {
		throw new Error('Pending member not found');
	}

	if (pendingMember.status !== 'pending') {
		throw new Error('Already joined');
	}

	const updatedUser = await UserModel.addClub(currentUserId, currentClubId);
	const updatedClub = await ClubModel.updateMemberStatus({ _id: currentClubId, userId: currentUserId }, { status: 'accepted' });

	return { user: updatedUser, club: updatedClub };
}

module.exports = {
	create,
	deleteClub,
	addMember,
	acceptInvitation,
};
