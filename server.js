﻿const app = require('./app.js');

const port = process.env.PORT || 4000;

const server = app.listen(port, function () {
    console.log('Server listening on port ' + port);
});