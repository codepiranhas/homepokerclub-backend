const errorService = require('../services/error.service');
const randomGenerators = require('../helpers/randomGenerators');
const s3Utilities = require('../helpers/s3Utilities');
const config = require('../config/keys');

const foldersAllowed = [
	'member-avatars',
	'club-logos',
];

async function getSignedUrl(req, res, next) { // eslint-disable-line
	const { type, folder } = req.body;

	if (!req.user.sub || !type || !folder) {
		return next(errorService.err(400, 'Invalid parameters.'));
	}

	// Throw an error if the folder name is not one of the allowed ones
	if (!foldersAllowed.includes(folder)) {
		return next(errorService.err(400, 'Unknown folder.'));
	}

	const fileType = type.split('/')[1];
	const key = `${folder}/user-${req.user.sub}/${randomGenerators.uuid()}.${fileType}`;

	try {
		const url = await s3Utilities.getSignedUrl(config.s3BucketName, type, key);

		return res.status(200).json({ key, url });
	} catch (error) {
		return next(errorService.err(400, 'Error @ getSignedUrl @ uploadController'));
	}
}

async function deleteFile(req, res) {
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
	deleteFile,
};
