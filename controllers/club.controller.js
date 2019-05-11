const db = require('../helpers/db');
// const mailService = require('../services/mail.service');
// const notificationService = require('../services/notification.service');
const errorService = require('../services/error.service');

const ClubModel = db.Club;
const UserModel = db.User;

async function deleteClub(req, res) {
	const clubId = req.params.id;

	await ClubModel.deleteById(clubId);
	return res.status(200).json({ message: 'success' });
}

async function create(req, res, next) {
	const clubParam = req.body;
	const currentUserId = req.user.sub;

	if (!clubParam || !clubParam.name || !currentUserId) {
		return next(errorService.err(400, 'Invalid parameters.'));
	}

	const savedClub = await ClubModel.create(clubParam, currentUserId);
	const updatedUser = await UserModel.addClub(currentUserId, savedClub._id);

	return res.status(200).json({ club: savedClub, user: updatedUser });
}

async function addMember(req, res, next) {
	const newMember = req.body;
	const currentClubId = req.params.id;

	if (!newMember || !newMember.name || !currentClubId) {
		return next(errorService.err(400, 'Invalid parameters.'));
	}

	const updatedClub = await ClubModel.addMember(currentClubId, newMember);

	return res.status(200).json({ message: 'success', club: updatedClub });
}

async function updateMember(req, res, next) {
	const member = req.body;
	const { memberId } = req.params;
	const currentClubId = req.params.id;

	if (!member || !memberId || !member.name || !currentClubId) {
		return next(errorService.err(400, 'Invalid parameters.'));
	}

	const updatedClub = await ClubModel.updateMemberDetails({ _id: currentClubId, memberId }, member);


	return res.status(200).json({ message: 'success', club: updatedClub });
}

async function removeMember(req, res, next) {
	const currentClubId = req.params.id;
	const { memberId } = req.params;

	if (!memberId || !currentClubId) {
		return next(errorService.err(400, 'Invalid parameters.'));
	}

	const updatedClub = await ClubModel.removeMember(currentClubId, memberId);

	return res.status(200).json({ message: 'success', club: updatedClub });
}

async function acceptInvitation(req, res, next) {
	const currentUserId = req.user.sub;
	const currentClubId = req.params.id;

	if (!currentUserId || !currentClubId) {
		return next(errorService.err(400, 'Invalid parameters.'));
	}

	const club = await ClubModel.findById(currentClubId);
	const pendingMember = club.members.find(member => member.userId.toString() === currentUserId);

	if (!pendingMember) {
		return next(errorService.err(400, 'Pending member not found.'));
	}

	if (pendingMember.status !== 'pending') {
		return next(errorService.err(400, 'This member has already joined the club.'));
	}

	const updatedUser = await UserModel.addClub(currentUserId, currentClubId);
	const updatedClub = await ClubModel.updateMemberStatus({ _id: currentClubId, userId: currentUserId }, { status: 'accepted' });

	return res.status(200).json({ user: updatedUser, club: updatedClub });
}

module.exports = {
	create,
	deleteClub,
	addMember,
	updateMember,
	removeMember,
	acceptInvitation,
};

/**
 * Kept for the coolness of it. (and to have notifications creation example)
 */
// async function addMember(req, res, next) {
// 	const newMember = req.body;
// 	const currentUserId = req.user.sub;
// 	const currentClubId = req.params.id;

// 	if (!newMember || !newMember.email || !currentUserId || !currentClubId) {
// 		console.log({ newMember });
// 		console.log({ currentUserId });
// 		console.log({ currentClubId });
// 		return next(errorService.err(400, 'Invalid parameters.'));
// 	}

// 	const promises = [
// 		UserModel.findById(currentUserId), // User that started the invitation
// 		UserModel.findByEmail(newMember.email), // User that is about to join
// 		ClubModel.findById(currentClubId), // Current club
// 	];

// 	const [inviter, invitee, club] = await Promise.all(promises);

// 	if (!inviter || !club) {
// 		return next(errorService.err(400, 'The inviter and/or club were not found.'));
// 	}

// 	if (!invitee) {
// 		console.log('User has no account in app');
// 		// User does not have an account in the app
// 		// Create invitation
// 		try {
// 			const notification = await notificationService.create({
// 				type: 'club-invitation-new-user',
// 				message: `${inviter.name} has invited you to join the club ${club.name}`,
// 				senderId: currentUserId,
// 				receiverEmail: newMember.email,
// 				body: {
// 					clubId: club._id,
// 				},
// 			});
// 			// Send email
// 			await mailService.sendClubInvitation(inviter, invitee, club, notification.token);
// 		} catch (error) {
// 			return next(errorService.err(400, error));
// 		}
// 	} else {
// 		console.log('User exists in the app');
// 		const isAlreadyInClub = club.members.some(member => member.userId.toString() === invitee._id.toString()); // eslint-disable-line
// 		if (!isAlreadyInClub) {
// 			console.log('User already in the club');
// 			return next(errorService.err(400, 'This member is already in the club or has a pending invitation.'));
// 		}
// 		// User exists in app, but on in club
// 		// Create invitation
// 		try {
// 			const notification = await notificationService.create({
// 				type: 'club-invitation-existing-user',
// 				message: `${inviter.name} has invited you to join the club ${club.name}`,
// 				senderId: currentUserId,
// 				receiverEmail: newMember.email,
// 				body: {
// 					clubId: club._id,
// 				},
// 			});
// 			// Send an email to join the app and club
// 			await mailService.sendClubInvitation(inviter, invitee, club, notification.token);
// 		} catch (error) {
// 			return next(errorService.err(400, error));
// 		}
// 	}

// 	return res.status(200).json({ message: 'success' });
// }
