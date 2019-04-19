console.log('===> NODE_ENV @ KEYS: ', process.env.NODE_ENV); // eslint-disable-line

const productionKeys = require('./production');
const developmentKeys = require('./development');

if (process.env.NODE_ENV === 'production') {
	module.exports = productionKeys;
} else if (process.env.NODE_ENV === 'development') {
	module.exports = developmentKeys;
} else {
	const localKeys = require('./local'); // eslint-disable-line
	module.exports = localKeys;
}
