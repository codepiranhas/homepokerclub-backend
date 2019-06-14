module.exports = {
	secretJWT: process.env.SECRET_JWT,
	sendgridApiKey: process.env.SENDGRID_KEY,
	mongoURI: process.env.MONGO_URI,

	awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
	awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,

	s3BucketName: 'homepokerclub',

	frontendUrl: 'http://homepokerclub.netlify.com',
	backendUrl: 'https://homepokerclub-production.herokuapp.com',
};
