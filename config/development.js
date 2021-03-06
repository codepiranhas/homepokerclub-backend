module.exports = {
	secretJWT: process.env.SECRET_JWT,
	sendgridApiKey: process.env.SENDGRID_KEY,
	mongoURI: process.env.MONGO_URI,

	s3BucketName: 'homepokerclub-dev',

	frontendUrl: 'http://localhost:3000',
	backendUrl: 'http://localhost:5000',
};
