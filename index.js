var isBrowser = require('is-browser');




module.exports = isBrowser ? require('./HTMLVideo') : require('./PlaskVideo');
