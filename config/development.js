module.exports = {
  secretJWT: process.env.SECRET_JWT,
  sendgridApiKey: process.env.SENDGRID_KEY,
  mongoURI: process.env.MONGO_URI,

  frontendUrl: 'http://localhost:3000',
  backendUrl: 'http://localhost:5000'
};