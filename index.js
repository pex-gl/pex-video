var isPlask = require('is-plask');

module.exports = isPlask ? require('./PlaskVideo') : require('./HTMLVideo');
