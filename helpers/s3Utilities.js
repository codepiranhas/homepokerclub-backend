const AWS = require('aws-sdk');
const config = require('../config/keys');

const s3 = new AWS.S3({
	accessKeyId: config.awsAccessKeyId,
	secretAccessKey: config.awsSecretAccessKey,
});

function deleteFile(bucket, key) {
	return new Promise((resolve, reject) => {
		const params = {
			Bucket: bucket,
			Key: key,
		};

		s3.deleteObject(params, (err, data) => { // eslint-disable-line
			if (err) {
				reject(err);
			} else {
				resolve('success');
			}
		});
	});
}

async function emptyS3Directory(bucket, dir) {
	const listParams = {
		Bucket: bucket,
		Prefix: dir,
	};

	const listedObjects = await s3.listObjectsV2(listParams).promise();

	if (listedObjects.Contents.length === 0) return;

	const deleteParams = {
		Bucket: bucket,
		Delete: { Objects: [] },
	};

	listedObjects.Contents.forEach(({ Key }) => {
		deleteParams.Delete.Objects.push({ Key });
	});

	await s3.deleteObjects(deleteParams).promise();

	if (listedObjects.IsTruncated) await emptyS3Directory(bucket, dir);
}

function getSignedUrl(bucket, type, key) {
	return new Promise((resolve, reject) => {
		s3.getSignedUrl('putObject', {
			Bucket: bucket,
			ContentType: type,
			Key: key,
		}, (err, url) => {
			if (err) {
				reject(err);
			} else {
				resolve(url);
			}
		});
	});
}

module.exports = {
	deleteFile,
	emptyS3Directory,
	getSignedUrl,
};
