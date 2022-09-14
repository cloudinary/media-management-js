require('dotenv').load({
  silent: true
});

if (!process.env.CLD_MEDIA_MANAGEMENT) {
  throw 'Could not start tests - Cloudinary URL is undefined'
}

global.expect = require('expect.js');
require('./testUtils/testBootstrap');
