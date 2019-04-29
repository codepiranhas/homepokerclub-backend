function err(code = 400, message = 'An error occured.') {
	const error = new Error(message);
	error.statusCode = code;

	return error;
}

module.exports = {
	err,
};
