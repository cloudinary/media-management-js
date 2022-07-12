const fs = require('fs');
const os = require('os');
const defaults = require('lodash/defaults');
const cloudinary = require("../../cloudinary");
const helper = require("../spechelper");
const TIMEOUT = require('../testUtils/testConstants').TIMEOUT;
const describe = require('../testUtils/suite');
const wait = require('../testUtils/helpers/wait');

const utils = require('../../lib/utils');
const { clone, merge, pickOnlyExistingValues } = utils;
const { sharedExamples } = helper;

const TEST_TAG = helper.TEST_TAG;
const createTestConfig = require('../testUtils/createTestConfig');
// Defined globals
var cloud_name = '';

var root_path = '';

describe("utils", function () {
  afterEach(function () {
    cloudinary.config(defaults({
      secure: null
    }, this.orig));
  });
  beforeEach(function () {
    // eslint-disable-next-line max-len
    // @cfg= cloudinary.config( {cloud_name:"test123", secure_distribution : null, private_cdn : false, secure : false, cname : null ,cdn_subdomain : false, api_key : "1234", api_secret: "b" })
    this.cfg = cloudinary.config(createTestConfig({
      secure_distribution: null,
      private_cdn: false,
      secure: false,
      cname: null,
      cdn_subdomain: false,
      signature_algorithm: undefined
    }));
    this.orig = clone(this.cfg);
    cloud_name = cloudinary.config("cloud_name");
    root_path = `https://res.cloudinary.com/${cloud_name}`;
  });
  sharedExamples("a signed url", function (specific_options = {}, specific_transformation = "") {
    var authenticated_image, authenticated_path, expected_transformation, options;
    this.timeout(TIMEOUT.LONG);
    expected_transformation = ((specific_transformation.blank != null) || specific_transformation.match(/\/$/)) ? specific_transformation : `${specific_transformation}/`;
    authenticated_path = '';
    authenticated_image = {};
    options = {};
    before(function () {
      cloudinary.config(true);
      return cloudinary.uploader.upload("https://res.cloudinary.com/demo/image/upload/sample.jpg", {
        type: 'authenticated',
        tags: TEST_TAG
      }).then(function (result) {
        authenticated_image = result;
        authenticated_path = `${root_path}/image/authenticated`;
      });
    });
    beforeEach(function () {
      options = merge({
        version: authenticated_image.version,
        sign_url: true,
        type: "authenticated"
      }, specific_options);
    });
  });
  describe('build_eager', function () {
    const scaled = options => Object.assign(
      {
        width: 100,
        height: 200,
        crop: 'scale'
      },
      options
    );
    const sepia = options => Object.assign({
      width: 400,
      crop: 'lfill',
      effect: 'sepia'
    }, options);
    [
      ['should support strings',
        ['c_scale,h_200,w_100', 'c_lfill,e_sepia,w_400/jpg'],
        'c_scale,h_200,w_100|c_lfill,e_sepia,w_400/jpg'],
      ['should concatenate transformations using pipe',
        [scaled(), sepia()],
        'c_scale,h_200,w_100|c_lfill,e_sepia,w_400'],
      ['should support transformations with multiple components',
        [{ transformation: [scaled(), sepia()] }, sepia()],
        'c_scale,h_200,w_100/c_lfill,e_sepia,w_400|c_lfill,e_sepia,w_400'],
      ['should concatenate format at the end of the transformation',
        ([scaled({ format: 'gif' }), sepia()]),
        'c_scale,h_200,w_100/gif|c_lfill,e_sepia,w_400'],
      ['should support an empty format',
        ([scaled({ format: '' }), sepia()]),
        'c_scale,h_200,w_100/|c_lfill,e_sepia,w_400'],
      ['should treat a null format as none',
        ([scaled({ format: null }), sepia()]),
        'c_scale,h_200,w_100|c_lfill,e_sepia,w_400'],
      ['should concatenate format at the end of the transformation',
        ([scaled({ format: 'gif' }), sepia({ format: 'jpg' })]),
        'c_scale,h_200,w_100/gif|c_lfill,e_sepia,w_400/jpg'],
      ['should support transformations with multiple components and format',
        [{
          transformation: [scaled(), sepia()],
          format: 'gif'
        }, sepia()],
        'c_scale,h_200,w_100/c_lfill,e_sepia,w_400/gif|c_lfill,e_sepia,w_400']
    ].forEach(function ([subject, input, expected]) {
      it(subject, function () {
        expect(utils.build_eager(input)).to.eql(expected);
      });
    });
    it("build_explicit_api_params should support multiple eager transformations with a pipe", function () {
      var options = {
        eager: [scaled(), sepia()]
      };
      expect(utils.build_explicit_api_params('some_id', options)[0].eager).to.eql("c_scale,h_200,w_100|c_lfill,e_sepia,w_400");
    });
    it("build_explicit_api_params should support moderation", function () {
      expect(utils.build_explicit_api_params('some_id', {
        type: 'upload',
        moderation: 'manual'
      })[0].moderation).to.eql('manual');
    });
    it("archive_params should support multiple eager transformations with a pipe", function () {
      var options = {
        transformations: [scaled(), sepia()]
      };
      expect(utils.archive_params(options).transformations).to.eql("c_scale,h_200,w_100|c_lfill,e_sepia,w_400");
    });
  });
  it("build_explicit_api_params should support phash", function () {
    expect(utils.build_explicit_api_params('some_id', {
      type: 'upload',
      phash: true
    })[0].phash).to.eql('1');
  });
  it("build_upload_params canonize booleans", function () {
    var actual, expected, options, params;
    options = {
      backup: true,
      use_filename: false,
      colors: "true",
      image_metadata: "false",
      invalidate: 1
    };
    params = utils.build_upload_params(options);
    expected = pickOnlyExistingValues(params, ...Object.keys(options));
    actual = {
      backup: 1,
      use_filename: 0,
      colors: 1,
      image_metadata: 0,
      invalidate: 1
    };
    expect(expected).to.eql(actual);
    expect(utils.build_upload_params({
      backup: null
    }).backup).to.eql(void 0);
    expect(utils.build_upload_params({}).backup).to.eql(void 0);
  });
  describe('verifyNotificationSignature', function () {
    let expected_parameters, unexpected_parameters, response_json, unexpected_response_json,
      valid_response_timestamp, invalid_response_timestamp, response_signature;
    before(function () {
      expected_parameters = {
        'public_id': "b8sjhoslj8cq8ovoa0ma",
        'version': "1555337587",
        'width': 1000,
        'height': 800
      };
      unexpected_parameters = {
        'public_id': "b8sjhoslj8cq8ovoa0er",
        'version': "1555337587",
        'width': 100,
        'height': 100
      };
      valid_response_timestamp = (Date.now()/1000) - 5000;
      invalid_response_timestamp = (Date.now()/1000) - 10000;
      response_json = JSON.stringify(expected_parameters);
      unexpected_response_json = JSON.stringify(unexpected_parameters);
    });
    it("should return true when signature is valid", function () {
      response_signature = utils.webhook_signature(response_json, valid_response_timestamp, {
        api_secret: cloudinary.config().api_secret
      });
      expect(
        utils.verifyNotificationSignature(
          response_json,
          valid_response_timestamp,
          response_signature
        )
      ).to.eql(true);
    });
    it("should return true when signature with algorithm SHA256 is valid", function () {
      cloudinary.config({
        api_secret: 'hardcoded',
        signature_algorithm: 'sha256'
      });
      const distant_future_timestamp = 7952342400000; // 2222-01-01T00:00:00Z
      expect(
        utils.verifyNotificationSignature(
          response_json,
          distant_future_timestamp,
          "6c5a29fd8815772fbac2f10ae741e093d0859313947ef8fadeb29126ded6649c"
        )
      ).to.eql(true);
    });
    it("should return false when signature is not valid", function () {
      response_signature = utils.webhook_signature(response_json, valid_response_timestamp, {
        api_secret: cloudinary.config().api_secret
      });
      expect(
        utils.verifyNotificationSignature(
          unexpected_response_json,
          valid_response_timestamp,
          response_signature
        )
      ).to.eql(false);
    });
    it("should return false when body, timestamp, or signature aren't given", function () {
      response_signature = utils.webhook_signature(response_json, valid_response_timestamp, {
        api_secret: cloudinary.config().api_secret
      });
      expect(utils.verifyNotificationSignature(response_json, valid_response_timestamp)).to.eql(false);
      expect(utils.verifyNotificationSignature(response_json)).to.eql(false);
      expect(utils.verifyNotificationSignature()).to.eql(false);
    });
    it("should return false when timestamp is too far past with default validity expiration time", function () {
      response_signature = utils.webhook_signature(response_json, invalid_response_timestamp, {
        api_secret: cloudinary.config().api_secret
      });
      expect(
        utils.verifyNotificationSignature(
          response_json,
          invalid_response_timestamp,
          response_signature
        )
      ).to.eql(false);
    });
    it("should return false when timestamp is too far past with custom validity expiration time", function () {
      response_signature = utils.webhook_signature(response_json, valid_response_timestamp, {
        api_secret: cloudinary.config().api_secret
      });
      expect(
        utils.verifyNotificationSignature(
          response_json,
          valid_response_timestamp,
          response_signature,
          10
        )
      ).to.eql(false);
    });
  });
  describe("encode_double_array", function () {
    it("should correctly encode double arrays", function () {
      expect(utils.encode_double_array([1, 2, 3, 4])).to.eql("1,2,3,4");
      expect(utils.encode_double_array([[1, 2, 3, 4], [5, 6, 7, 8]])).to.eql("1,2,3,4|5,6,7,8");
    });
  });
  it("should call validate_webhook_signature", function () {
    var data, orig, sig, timestamp;
    this.timeout(1000);
    data = '{"public_id":"117e5550-7bfa-11e4-80d7-f962166bd3be","version":1417727468}';
    timestamp = 1417727468;
    orig = cloudinary.config();
    cloudinary.config({
      api_key: 'key',
      api_secret: 'shhh'
    });
    sig = utils.webhook_signature(data, timestamp);
    expect(sig).to.eql('bac927006d3ce039ef7632e2c03189348d02924a');
    cloudinary.config(orig);
  });
});
