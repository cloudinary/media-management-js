
const utils = require("../../../lib/utils");

describe("getUserAgent", function () {
  var platform = "";
  before(function () {
    platform = utils.userPlatform;
    utils.userPlatform = "";
  });
  after(function () {
    utils.userPlatform = platform;
  });
  it("should add a user platform to USER_AGENT", function () {
    utils.userPlatform = "Spec/1.0 (Test)";
    expect(utils.getUserAgent()).to.match(/Spec\/1.0 \(Test\) CloudinaryNodeJS\/[\d.]+ \(Node [\d.]+\)/);
  });
});
