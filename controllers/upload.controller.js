const errorService = require('../services/error.service');
const randomGenerators = require('../helpers/randomGenerators');
const s3Utilities = require('../helpers/s3Utilities');
const config = require('../config/keys');

async function getSignedUrl(req, res, next) { // eslint-disable-line
	const { type } = req.body;

	if (!req.user.sub || !type) {
		return next(errorService.err(400, 'Invalid parameters.'));
	}

	const key = `avatars/user-${req.user.sub}/${randomGenerators.uuid()}.jpeg`;

	try {
		const url = await s3Utilities.getSignedUrl(config.s3BucketName, type, key);

		return res.status(200).json({ key, url });
	} catch (error) {
		return next(errorService.err(400, 'Error @ getSignedUrl @ uploadController'));
	}
}

async function deleteAvatar(req, res) {
	const { url } = req.body;

	try {
		await s3Utilities.deleteFile(config.s3BucketName, url);
	} catch (error) {
		// log error
	}

	return res.status(200).json({ message: 'success' });
}

module.exports = {
	getSignedUrl,
	deleteAvatar,
};
