const db = require('../helpers/db');

const NotificationModel = db.Notification;
const UserModel = db.User;

async function create(notificationParam) {
	if (!notificationParam
		|| !notificationParam.type
		|| !notificationParam.receiverId
		|| !notificationParam.message) {
		throw new Error('Invalid parameters');
	}

	const savedNotification = await NotificationModel.create(notificationParam);

	return { notification: savedNotification };
}

async function view(params) {
	if (!params.currentUserId || params.invitationId) {
		throw new Error('Invalid parameters');
	}

	const invitation = await NotificationModel.findById(params.invitationId);

	if (invitation.invitedToClubId) {
		const updatedUser = await UserModel.addClub(params.currentUserId, invitation.invitedToClubId);
		// const updatedClub = await ClubModel.addMember(invitation.invitedTo, userId);

		NotificationModel.updateOne({ _id: invitation }, { resolvedTo: 'accepted', resolvedAt: Date.now });

		return { user: updatedUser };
	}

	throw new Error('Invalid parameters');
}

async function deleteNotification(notificationId) {
	await NotificationModel.deleteById(notificationId);
}

module.exports = {
	create,
	view,
	deleteNotification,
};
