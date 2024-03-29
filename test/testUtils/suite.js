const cloudinary = require("../../cloudinary");

function makeSuite(name, tests) {
  describe(name, function () {
    before("Verify configuration", function () {
      var config = cloudinary.config(true);
      if (!(config.api_key && config.api_secret)) {
        expect().fail("Missing key and secret. Please set CLD_MEDIA_MANAGEMENT.");
      }
    });
    tests.apply(this);
  });
}

module.exports = makeSuite;
