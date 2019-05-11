const db = require('../helpers/db');
const config = require('../config/keys');
const errorService = require('../services/error.service');

const ClubModel = db.Club;
const UserModel = db.User;
const NotificationModel = db.Notification;

async function resolveClubInviteExistingUser(notification, res, next) {
	const promises = [
		UserModel.findByEmail(notification.receiverEmail), // User that is about to join
		ClubModel.findById(notification.body.clubId), // Current club
	];

	const [invitee, club] = await Promise.all(promises);

	// If user has already joined the club, stop
	const isAlreadyInClub = club.members.some(member => member.userId.toString() === invitee._id.toString()); // eslint-disable-line
	if (isAlreadyInClub) {
		return next(errorService.err(400, 'This member is already in the club.'));
	}

	const newMember = {
		userId: invitee._id,
		status: 'active',
		level: 'member',
	};

	const updatePromises = [
		ClubModel.addMember(club._id, newMember),
		UserModel.addClub(invitee._id, club._id),
	];

	await Promise.all(updatePromises);

	return res.redirect(`${config.frontendUrl}/?notify=joinedclub`);
}

async function resolveClubInviteNewUser(notification, res, next) {
	// To be implemented
}

async function resolve(req, res, next) {
	const { type, token, response } = req.params;

	if (!type || !token || !response) {
		return next(errorService.err(400, 'Invalid Parameters @ resolve @ notification.controller.'));
	}
	// Find the notification by token
	const notification = await NotificationModel.findByToken(token);

	if (!notification) {
		return next(errorService.err(400, 'Notification not found @ resolve @ notification.controller.'));
	}

	if (notification.type === 'club-invitation-existing-user') {
		resolveClubInviteExistingUser(notification, res, next);
	} else if (notification.type === 'club-invitation-new-user') {
		resolveClubInviteNewUser(notification, res, next);
	} else {
		next(errorService.err(400, 'No notification action method was found.'));
	}

	return null;
}

module.exports = {
	resolve,
};
