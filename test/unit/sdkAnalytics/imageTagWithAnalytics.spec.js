const path = require('path');
const mock = require('mock-fs');
const getSDKVersions = require('../../../lib/utils/encoding/sdkAnalytics/getSDKVersions');
const cloudinary = require('../../../cloudinary');
const TEST_CLOUD_NAME = require('../../testUtils/testConstants').TEST_CLOUD_NAME;
const utils = require('../../../lib/utils');

describe('Tests for sdk analytics through image tag', function () {
  let processVersions = {};



  beforeEach(() => {
    cloudinary.config(true); // reset

    processVersions = process.versions;
    delete process.versions;

    let file = path.join(__dirname, '../../../package.json');

    mock({
      [file]: '{"version":"1.24.0"}'
    });
  });

  afterEach(function () {
    mock.restore();
    process.versions = processVersions;
  });

  it('Defaults to false if analytics is not passed as an option', () => {
    process.versions = {
      node: '12.0.0'
    };

    let imgStr = utils.url("hello", {
      format: "png"
    });

    expect(imgStr).not.to.contain(`MAlhAM0`);
  });

  it('Reads from process.versions and package.json (Mocked)', () => {
    process.versions = {
      node: '12.0.0'
    };

    let imgStr = utils.url("hello", {
      format: "png",
      urlAnalytics: true
    });

    expect(imgStr).to.contain(`https://res.cloudinary.com/${TEST_CLOUD_NAME}/image/upload/hello.png?_s=AMAlhAM0`);
  });

  it('Reads from process.versions and package.json (Mocked) - Responsive', () => {
    process.versions = {
      node: '12.0.0'
    };

    let imgStr = utils.url("hello", {
      format: "png",
      responsive: true,
      urlAnalytics: true
    });

    expect(imgStr).to.contain(`https://res.cloudinary.com/${TEST_CLOUD_NAME}/image/upload/hello.png?_s=AMAlhAMA`);
  });
});
