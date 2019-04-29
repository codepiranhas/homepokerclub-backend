const db = require('../helpers/db');
const mailService = require('../services/mail.service');
const notificationService = require('../services/notification.service');
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
	const memberParam = req.body;
	const currentUserId = req.user.sub;
	const currentClubId = req.params.id;

	if (!memberParam || !memberParam.userId || !currentUserId || !currentClubId) {
		return next(errorService.err(400, 'Invalid parameters.'));
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
			return next(errorService.err(400, 'This member is already in the club or has a pending invitation.'));
		}

		// Add the new member to the club with status "pending"
		const updatedClub = await ClubModel.addMember(currentClubId, memberParam);
		// Create a notification for the member
		try {
			await notificationService.create({
				type: 'club-invitation',
				message: `${inviter.name} has invited you to join the club ${updatedClub.name}`,
				senderId: currentUserId,
				receiverId: memberParam.userId,
				body: {
					clubId: updatedClub._id,
				},
			});
		} catch (error) {
			return next(errorService.err(400, error));
		}

		// Send an email to the member
		await mailService.sendClubInvitation(inviter, invitee, updatedClub);

		return res.status(200).json({ club: updatedClub });
	}

	return next(errorService.err(400, 'No inviter or invitee found.'));
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
	acceptInvitation,
};
