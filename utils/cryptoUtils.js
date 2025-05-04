require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const SimpleCrypto = require('simple-crypto-js').default;

const simpleCrypto = new SimpleCrypto(process.env.ENCRYPTION_KEY);

module.exports = simpleCrypto;
