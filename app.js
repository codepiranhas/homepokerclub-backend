const express = require('express');
const cors = require('cors');
const jwt = require('./helpers/jwt');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(express.json());
app.use(cors());

// use JWT auth to secure the API
app.use(jwt());

// API routes
app.use('/v1/users', require('./routes/user.routes'));
app.use('/v1/clubs', require('./routes/club.routes'));
app.use('/v1/tournaments', require('./routes/tournament.routes'));
app.use('/v1/notifications', require('./routes/notification.routes'));
app.use('/v1/uploads', require('./routes/upload.routes'));

// Route to test API health
app.get('/v1/status', (req, res) => res.send("It's alive!"));

// global error handler
app.use(errorHandler);

// Export the express app
module.exports = app;
