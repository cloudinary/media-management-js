const fs = require('fs');
const os = require('os');
const defaults = require('lodash/defaults');
const cloudinary = require("../../cloudinary");
const helper = require("../spechelper");
const TIMEOUT = require('../testUtils/testConstants').TIMEOUT;
const describe = require('../testUtils/suite');
const wait = require('../testUtils/helpers/wait');
const generateBreakpoints = require(`../../${helper.libPath}/utils/generateBreakpoints`);
const { srcsetUrl, generateSrcsetAttribute } = require(`../../${helper.libPath}/utils/srcsetUtils`);

const utils = require('../../lib/utils');
const { clone, isString, merge, pickOnlyExistingValues } = utils;
const { sharedExamples, itBehavesLike, test_cloudinary_url } = helper;

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
    it("should correctly sign URL with version", function (done) {
      expect([`${authenticated_image.public_id}.jpg`, options]).to.produceUrl(new RegExp(`${authenticated_path}/s--[\\w-]+--/${expected_transformation}v${authenticated_image.version}/${authenticated_image.public_id}.jpg`)).and.emptyOptions().and.beServedByCloudinary(done);
    });
    it("should correctly sign URL with transformation and version", function (done) {
      options.transformation = {
        crop: "crop",
        width: 10,
        height: 20
      };
      expect([`${authenticated_image.public_id}.jpg`, options]).to.produceUrl(new RegExp(`${authenticated_path}/s--[\\w-]+--/c_crop,h_20,w_10/${expected_transformation}v${authenticated_image.version}/${authenticated_image.public_id}.jpg`)).and.emptyOptions().and.beServedByCloudinary(done);
    });
    it("should correctly sign fetch URL", function (done) {
      options.type = "fetch";
      expect(["https://res.cloudinary.com/demo/sample.png", options]).to.produceUrl(new RegExp(`^${root_path}/image/fetch/s--[\\w-]+--/${expected_transformation}v${authenticated_image.version}/https://res.cloudinary.com/demo/sample.png$`)).and.emptyOptions().and.beServedByCloudinary(done);
    });
  });
  describe('URL options', function () {
    it("should use cloud_name from config", function () {
      test_cloudinary_url("test", {}, `https://res.cloudinary.com/${cloud_name}/image/upload/test`, {});
    });
    it("should allow overriding cloud_name in options", function () {
      test_cloudinary_url("test", {
        cloud_name: "test321"
      }, "https://res.cloudinary.com/test321/image/upload/test", {});
    });
    it("should use format from options", function () {
      test_cloudinary_url("test", {
        format: 'jpg'
      }, `https://res.cloudinary.com/${cloud_name}/image/upload/test.jpg`, {});
    });
    it("should support url_suffix in shared distribution", function () {
      test_cloudinary_url("test", {
        url_suffix: "hello"
      }, `https://res.cloudinary.com/${cloud_name}/images/test/hello`, {});
      test_cloudinary_url("test", {
        url_suffix: "hello",
        angle: 0
      }, `https://res.cloudinary.com/${cloud_name}/images/a_0/test/hello`, {});
    });
    it("should disallow url_suffix in non upload types", function () {
      expect(function () {
        utils.url("test", {
          url_suffix: "hello",
          private_cdn: true,
          type: 'facebook'
        });
      }).to.throwError(/URL Suffix only supported for image\/upload, image\/private, image\/authenticated, video\/upload and raw\/upload/);
    });
    it("should disallow url_suffix with / or .", function () {
      expect(function () {
        utils.url("test", {
          url_suffix: "hello/world",
          private_cdn: true
        });
      }).to.throwError(/url_suffix should not include . or \//);
      expect(function () {
        utils.url("test", {
          url_suffix: "hello.world",
          private_cdn: true
        });
      }).to.throwError(/url_suffix should not include . or \//);
    });
    it("should use width and height from options only if crop is given", function () {
      test_cloudinary_url("test", {
        width: 100,
        height: 100,
        crop: 'crop'
      }, `https://res.cloudinary.com/${cloud_name}/image/upload/c_crop,h_100,w_100/test`, {
        width: 100,
        height: 100
      });
    });
    it("should support initial width and height", function () {
      test_cloudinary_url("test", {
        width: "iw",
        height: "ih",
        crop: 'crop'
      }, `https://res.cloudinary.com/${cloud_name}/image/upload/c_crop,h_ih,w_iw/test`, {
        width: "iw",
        height: "ih"
      });
    });
    it("should not pass width and height to html in case angle was used", function () {
      test_cloudinary_url("test", {
        width: 100,
        height: 100,
        crop: 'scale',
        angle: 'auto'
      }, `https://res.cloudinary.com/${cloud_name}/image/upload/a_auto,c_scale,h_100,w_100/test`, {});
    });
    it("should disallow radius arrays that contain 0 or more than 4 values", function () {
      expect(function () {
        return utils.url("test", {
          radius: [10, 20, 30, 10, 20]
        });
      }).to.throwError(/Radius array should contain between 1 and 4 values/);
      expect(function () {
        return utils.url("test", {
          radius: []
        });
      }).to.throwError(/Radius array should contain between 1 and 4 values/);
    });
    it("should disallow radius arrays containing null values", function () {
      expect(function () {
        return utils.url("test", {
          radius: [null, 20, 30, 10]
        });
      }).to.throwError(/Corner: Cannot be null/);
    });
    it("should use x, y, radius, prefix, gravity and quality from options", function () {
      test_cloudinary_url("test", {
        x: 1,
        y: 2,
        radius: 3,
        gravity: 'center',
        quality: 0.4,
        prefix: "a"
      }, `https://res.cloudinary.com/${cloud_name}/image/upload/g_center,p_a,q_0.4,r_3,x_1,y_2/test`, {});
      test_cloudinary_url("test", {
        gravity: 'auto',
        crop: "crop",
        width: "0.5"
      }, `https://res.cloudinary.com/${cloud_name}/image/upload/c_crop,g_auto,w_0.5/test`, {});
    });

    it("should use type from options", function () {
      test_cloudinary_url("test", {
        type: 'facebook'
      }, `https://res.cloudinary.com/${cloud_name}/image/facebook/test`, {});
    });
    it("should ignore http links only if type is not given", function () {
      test_cloudinary_url("https://test", {
        type: null
      }, "https://test", {});
      test_cloudinary_url("https://test", {
        type: "fetch"
      }, `https://res.cloudinary.com/${cloud_name}/image/fetch/https://test`, {});
    });
    it("should escape fetch urls", function () {
      test_cloudinary_url("https://blah.com/hello?a=b", {
        type: "fetch"
      }, `https://res.cloudinary.com/${cloud_name}/image/fetch/https://blah.com/hello%3Fa%3Db`, {});
    });
    it("should escape http urls", function () {
      test_cloudinary_url("https://www.youtube.com/watch?v=d9NF2edxy-M", {
        type: "youtube"
      }, `https://res.cloudinary.com/${cloud_name}/image/youtube/https://www.youtube.com/watch%3Fv%3Dd9NF2edxy-M`, {});
    });
    it('should escape api urls', function () {
      const folderName = "sub^folder's test";
      const url = utils.base_api_url(['folders', folderName]);
      expect(url).to.match(/folders\/sub%5Efolder%27s%20test$/);
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
  it("should add version if public_id contains /", function () {
    test_cloudinary_url("folder/test", {}, `https://res.cloudinary.com/${cloud_name}/image/upload/v1/folder/test`, {});
    test_cloudinary_url("folder/test", {
      version: 123
    }, `https://res.cloudinary.com/${cloud_name}/image/upload/v123/folder/test`, {});
  });
  it("should not add version if public_id contains version already", function () {
    test_cloudinary_url("v1234/test", {}, `https://res.cloudinary.com/${cloud_name}/image/upload/v1234/test`, {});
  });
  it("should not set default version v1 to resources stored in folders if force_version is set to false", function () {
    test_cloudinary_url("folder/test", {},
      `https://res.cloudinary.com/${cloud_name}/image/upload/v1/folder/test`, {});
    test_cloudinary_url("folder/test",
      { force_version: false }, `https://res.cloudinary.com/${cloud_name}/image/upload/folder/test`, {});
  });
  it("explicitly set version is always passed", function () {
    test_cloudinary_url("test",
      {
        force_version: false,
        version: '1234'
      }, `https://res.cloudinary.com/${cloud_name}/image/upload/v1234/test`, {});
    test_cloudinary_url("folder/test",
      {
        force_version: false,
        version: '1234'
      }, `https://res.cloudinary.com/${cloud_name}/image/upload/v1234/folder/test`, {});
  });
  it("should use force_version from config", function () {
    cloudinary.config({ force_version: false });
    test_cloudinary_url("folder/test",
      {}, `https://res.cloudinary.com/${cloud_name}/image/upload/folder/test`, {});
  });
  it("should override config with options", function () {
    cloudinary.config({ force_version: false });
    test_cloudinary_url("folder/test",
      { force_version: true }, `https://res.cloudinary.com/${cloud_name}/image/upload/v1/folder/test`, {});
  });
  it("should allow to shorted image/upload urls", function () {
    test_cloudinary_url("test", {
      shorten: true
    }, `https://res.cloudinary.com/${cloud_name}/iu/test`, {});
  });
  it("should escape public_ids", function () {
    const expressions = [
      // [source, target]
      ["a b", "a%20b"],
      ["a+b", "a%2Bb"],
      ["a%20b", "a%20b"],
      ["a-b", "a-b"],
      ["a??b", "a%3F%3Fb"],
      ["parentheses(interject)", "parentheses(interject)"],
      ["abcαβγאבג", "abc%CE%B1%CE%B2%CE%B3%D7%90%D7%91%D7%92"]
    ];
    expressions.forEach(([source, target]) => {
      expect(utils.url(source)).to.eql(`https://res.cloudinary.com/${cloud_name}/image/upload/${target}`);
    });
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
  describe('generateBreakpoints', function () {
    it('should accept breakpoints', function () {
      expect(generateBreakpoints({
        breakpoints: [1, 2, 3]
      })).to.eql([1, 2, 3]);
    });
    it('should accept min_width, max_width', function () {
      expect(generateBreakpoints({
        min_width: 100,
        max_width: 600,
        max_images: 7
      })).to.eql([100, 184, 268, 352, 436, 520, 600]);
    });
  });
  describe('srcsetUrl', function () {
    it('should generate url', function () {
      var url = srcsetUrl('sample.jpg', 101, {
        width: 200,
        crop: 'scale'
      });
      expect(url).to.eql(`https://res.cloudinary.com/${cloud_name}/image/upload/c_scale,w_200/c_scale,w_101/sample.jpg`);
    });
    it("should generate url without a transformation", function () {
      var url = srcsetUrl('sample.jpg', 101, {});
      expect(url).to.eql(`https://res.cloudinary.com/${cloud_name}/image/upload/c_scale,w_101/sample.jpg`);
    });
  });
});
