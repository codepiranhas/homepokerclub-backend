const mongoose = require('mongoose');
const config = require('../config/keys');

mongoose.connect(process.env.MONGODB_URI || config.mongoURI, { useCreateIndex: true, useNewUrlParser: true, useFindAndModify: false })
    .then(() => {
        console.log('Connected to DB');
    })
    .catch(err => {
        console.log('Error connection to DB: ', err);
    })
    
mongoose.Promise = global.Promise;

module.exports = {
    User: require('../models/user.model'),
    Token: require('../models/token.model'),
    Club: require('../models/club.model'),
    Tournament: require('../models/tournament.model'),
    Notification: require('../models/notification.model')
};
