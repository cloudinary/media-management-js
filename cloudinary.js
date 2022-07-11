if (Number(process.versions.node.split('.')[0]) < 8) {
  console.warn('DEPRECATION NOTICE - Node 6 has been scheduled for removal from the Cloudinary SDK');
  // required polyfills for native ES6/7 functions (such as String.prototype.padStart)
  require('core-js');
} else {
  module.exports = require('./lib/cloudinary');
}
