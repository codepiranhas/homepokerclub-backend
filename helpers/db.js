const mongoose = require('mongoose');
const config = require('../config/keys');

const userModel = require('../models/user.model');
const tokenModel = require('../models/token.model');
const clubModel = require('../models/club.model');
const tournamentModel = require('../models/tournament.model');
const notificationModel = require('../models/notification.model');

mongoose.connect(process.env.MONGODB_URI
|| config.mongoURI, { useCreateIndex: true, useNewUrlParser: true, useFindAndModify: false })
	.then(() => {
			console.log('Connected to DB'); // eslint-disable-line
	})
	.catch((err) => {
			console.log('Error connection to DB: ', err); // eslint-disable-line
	});

mongoose.Promise = global.Promise;

module.exports = {
	User: userModel,
	Token: tokenModel,
	Club: clubModel,
	Tournament: tournamentModel,
	Notification: notificationModel,
};
