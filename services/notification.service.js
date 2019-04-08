// const crypto = require('crypto');
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcryptjs');
const config = require('../config/keys');
const db = require('../helpers/db');
// const mailService = require('services/mail.service');
// const tokenService = require('services/token.service');
const NotificationModel = db.Notification;
const ClubModel = db.Club;
const UserModel = db.User;

module.exports = {
		create,
		view,
		deleteNotification
};

async function create(notificationParam) {
	console.log('notificationParam: ', notificationParam);
	
	if (!notificationParam || !notificationParam.type || !notificationParam._receiver || !notificationParam.message) {
    throw 'Invalid parameters';
	}
	
	const savedNotification = await NotificationModel.create(notificationParam);

  return { notification: savedNotification };
}

async function view(params) {
	if (!params._currentUser || params._invitation) {
    throw 'Invalid parameters';
	}

	const invitation = await NotificationModel.findById(params._invitation);

	console.log('invitation found: ', invitation);

	if (invitation._invitedToClub) {
		console.log('It is a club invitation');
		const updatedUser = await UserModel.addClub(params._currentUser, invitation.invitedToClub);
		// const updatedClub = await ClubModel.addMember(invitation.invitedTo, userId);

		NotificationModel.updateOne({ _id: invitation }, { resolvedTo: 'accepted', resolvedAt: Date.now });

		return { user: updatedUser, }
	}
}

async function deleteNotification(notificationId) {
	await NotificationModel.deleteById(notificationId);
}

