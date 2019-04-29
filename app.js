const express = require('express');
const cors = require('cors');
const jwt = require('./helpers/jwt');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(express.json());
app.use(cors());

// use JWT auth to secure the api
app.use(jwt());

// api routes
app.use('/v1/users', require('./routes/user.routes'));
app.use('/v1/clubs', require('./routes/club.routes'));
app.use('/v1/tournaments', require('./routes/tournament.routes'));

app.get('/v1/status', (req, res) => res.send("It's alive!"));

// global error handler
app.use(errorHandler);

// Export the express app
module.exports = app;
