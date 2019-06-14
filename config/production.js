module.exports = {
	secretJWT: process.env.SECRET_JWT,
	sendgridApiKey: process.env.SENDGRID_KEY,
	mongoURI: process.env.MONGO_URI,

	s3BucketName: 'homepokerclub',

	frontendUrl: 'http://homepokerclub.netlify.com',
	backendUrl: 'https://homepokerclub-production.herokuapp.com',
};
