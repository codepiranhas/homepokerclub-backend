function errorHandler(err, req, res, next) { // eslint-disable-line
	console.log('===> ERROR HANDLER: ', err.name + ' - ' + err.message); // eslint-disable-line

	// if (!err.statusCode) { err.statusCode = 500; } // eslint-disable-line

	// Example if we want to do something specific by checking
	// a property that we added when creating the error object.
	// if (err.shouldRedirect) {
	// 	return res.render('myErrorPage'); // Example
	// }

	// return res.status(err.statusCode).send(err.message);

	if (err.name === 'TypeError') {
		// Type error
		return res.status(400).json({ message: err.message, type: 'typeError' });
	}

	if (err.name === 'ValidationError') {
		// mongoose validation error
		return res.status(400).json({ message: err.message, type: 'validationError' });
	}

	if (err.name === 'UnauthorizedError') {
		// jwt authentication error
		return res.status(401).json({ message: 'Invalid Token', type: 'unauthorizedError' });
	}

	if (err.statusCode) {
		// custom application error
		return res.status(err.statusCode).json({ message: err.message, type: 'applicationError' });
	}

	// Internal system error
	return res.status(500).json({ message: err.message, type: 'internalError' });
}

module.exports = errorHandler;
