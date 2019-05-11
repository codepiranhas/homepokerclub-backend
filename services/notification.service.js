const crypto = require('crypto');
const db = require('../helpers/db');

const NotificationModel = db.Notification;
const UserModel = db.User;

function generateToken() {
	return crypto.randomBytes(16).toString('hex');
}

async function create(notificationParam) {
	if (!notificationParam
		|| !notificationParam.type
		|| (!notificationParam.receiverId && !notificationParam.receiverEmail)
		|| !notificationParam.message) {
		throw new Error('Invalid parameters @ notification.service');
	}

	const notificationToSave = { ...notificationParam, token: generateToken() };

	const savedNotification = await NotificationModel.create(notificationToSave);

	return savedNotification;
}

async function view(params) {
	if (!params.currentUserId || params.invitationId) {
		throw new Error('Invalid parameters @ notification.service');
	}

	const invitation = await NotificationModel.findById(params.invitationId);

	if (invitation.invitedToClubId) {
		const updatedUser = await UserModel.addClub(params.currentUserId, invitation.invitedToClubId);
		// const updatedClub = await ClubModel.addMember(invitation.invitedTo, userId);

		NotificationModel.updateOne({ _id: invitation }, { resolvedTo: 'accepted', resolvedAt: Date.now });

		return updatedUser;
	}

	throw new Error('Invalid parameters @ notification.service');
}

async function deleteNotification(notificationId) {
	await NotificationModel.deleteById(notificationId);
}

module.exports = {
	create,
	view,
	deleteNotification,
};
