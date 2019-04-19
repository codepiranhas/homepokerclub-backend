function errorHandler(err, req, res, next) { // eslint-disable-line
	console.log('===> ERROR HANDLER - name: ', err.name); // eslint-disable-line
	console.log('===> ERROR HANDLER - message: ', err.message); // eslint-disable-line

	if (typeof (err) === 'string') {
		// custom application error
		return res.status(400).json({ message: err });
	}

	if (err.name === 'Error') {
		// custom application error
		return res.status(400).json({ message: err.message });
	}

	if (err.name === 'TypeError') {
		// mongoose validation error
		return res.status(400).json({ message: err.message });
	}

	if (err.name === 'ValidationError') {
		// mongoose validation error
		return res.status(400).json({ message: err.message });
	}

	if (err.name === 'UnauthorizedError') {
		// jwt authentication error
		return res.status(401).json({ message: 'Invalid Token' });
	}

	// default to 500 server error
	return res.status(500).json({ message: err.message });
}

module.exports = errorHandler;
