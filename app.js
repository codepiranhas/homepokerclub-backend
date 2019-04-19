const express = require('express');
const cors = require('cors');
const jwt = require('./helpers/jwt');
const errorHandler = require('./helpers/error-handler');

const app = express();

app.use(express.json());
app.use(cors());

// use JWT auth to secure the api
app.use(jwt());

// api routes
app.use('/v1/users', require('./routes/user.routes'));
app.use('/v1/clubs', require('./routes/club.routes'));
app.use('/v1/tournaments', require('./routes/tournament.routes'));

app.get('/status', (req, res) => res.send("It's alive - heroku pipeline 2 - v1.0"));

// global error handler
app.use(errorHandler);

// Export the express app
module.exports = app;
