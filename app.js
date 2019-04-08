const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('./helpers/jwt');
const errorHandler = require('./helpers/error-handler');

app.use(express.json());
app.use(cors());

// use JWT auth to secure the api
app.use(jwt());

// api routes
app.use('/users', require('./routes/user.routes'));
app.use('/clubs', require('./routes/club.routes'));
app.use('/tournaments', require('./routes/tournament.routes'));

app.get('/status', (req, res) => res.send("It's alive!"));

// global error handler
app.use(errorHandler);

// Export the express app
module.exports = app;
