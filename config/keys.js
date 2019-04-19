console.log('===> NODE_ENV @ KEYS: ', process.env.NODE_ENV); // eslint-disable-line

const productionKeys = require('./production');
const developmentKeys = require('./development');
const localKeys = require('./local');

if (process.env.NODE_ENV === 'production') {
	module.exports = productionKeys;
} else if (process.env.NODE_ENV === 'development') {
	module.exports = developmentKeys;
} else {
	module.exports = localKeys;
}
