const app = require('./app.js');

const port = process.env.PORT || 4000;

const server = app.listen(port, () => {
	console.log(`Server listening on port ${port}`); // eslint-disable-line

	return server;
});
