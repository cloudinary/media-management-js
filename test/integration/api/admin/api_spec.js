const sinon = require('sinon');
const formatDate = require("date-fns").format;
const subDate = require("date-fns").sub;
const https = require('https');
const ProxyAgent = require('proxy-agent');
const ClientRequest = require('_http_client').ClientRequest;
const Q = require('q');
const cloudinary = require("../../../../cloudinary");
const helper = require("../../../spechelper");
const describe = require('../../../testUtils/suite');
const wait = require('../../../testUtils/helpers/wait');
const uploadImage = helper.uploadImage;
const shouldTestAddOn = helper.shouldTestAddOn;
const ADDON_OCR = helper.ADDON_OCR;
const callReusableTest = require('../../../testUtils/reusableTests/reusableTests').callReusableTest;
const testConstants = require('../../../testUtils/testConstants');
const retry = require('../../../testUtils/helpers/retry');
const API_V2 = cloudinary.api;

const {
  TIMEOUT,
  TAGS,
  PUBLIC_IDS,
  UNIQUE_JOB_SUFFIX_ID,
  PRESETS,
  TRANSFORMATIONS,
  PUBLIC_ID_PREFIX,
  UNIQUE_TEST_FOLDER,
  TEST_EVAL_STR
} = testConstants;

const {
  PUBLIC_ID,
  PUBLIC_ID_1,
  PUBLIC_ID_2,
  PUBLIC_ID_3,
  PUBLIC_ID_4,
  PUBLIC_ID_5,
  PUBLIC_ID_6,
  PUBLIC_ID_BACKUP_1,
  PUBLIC_ID_BACKUP_2,
  PUBLIC_ID_BACKUP_3,
  PUBLIC_ID_OCR_1
} = PUBLIC_IDS;

const {
  TEST_TAG,
  SDK_TAG,
  UPLOAD_TAGS
} = TAGS;

const {
  NAMED_TRANSFORMATION,
  NAMED_TRANSFORMATION2,
  EXPLICIT_TRANSFORMATION_NAME,
  EXPLICIT_TRANSFORMATION_NAME2
} = TRANSFORMATIONS;

const {
  API_TEST_UPLOAD_PRESET1,
  API_TEST_UPLOAD_PRESET2,
  API_TEST_UPLOAD_PRESET3,
  API_TEST_UPLOAD_PRESET4
} = PRESETS;

const EXPLICIT_TRANSFORMATION = {
  width: 100,
  crop: "scale",
  overlay: `text:Arial_60:${TEST_TAG}`
};
const EXPLICIT_TRANSFORMATION2 = {
  width: 200,
  crop: "scale",
  overlay: `text:Arial_60:${TEST_TAG}`
};

const METADATA_EXTERNAL_ID = "metadata_external_id_" + TEST_TAG;
const METADATA_DEFAULT_VALUE = "metadata_default_value_" + TEST_TAG;


function getAllTags({ resources }) {
  return resources
    .map(e => e.tags)
    .reduce(((a, b) => a.concat(b)), []);
}

function findByAttr(elements, attr, value) {
  return elements.find(element => element[attr] === value);
}


describe("api", function () {
  var contextKey = `test-key${UNIQUE_JOB_SUFFIX_ID}`;
  before(async function () {
    this.timeout(TIMEOUT.LONG);

    await cloudinary.api.addMetadataField({
      external_id: METADATA_EXTERNAL_ID,
      label: METADATA_EXTERNAL_ID,
      type: 'string',
      default_value: METADATA_DEFAULT_VALUE
    });

    await Q.all([
      uploadImage({
        public_id: PUBLIC_ID,
        tags: UPLOAD_TAGS,
        context: "key=value",
        eager: [EXPLICIT_TRANSFORMATION]
      }),
      uploadImage({
        public_id: PUBLIC_ID_2,
        tags: UPLOAD_TAGS,
        context: "key=value",
        eager: [EXPLICIT_TRANSFORMATION]
      }),
      uploadImage({
        public_id: PUBLIC_ID_5,
        tags: UPLOAD_TAGS,
        context: `${contextKey}=test`,
        eager: [EXPLICIT_TRANSFORMATION]
      }),
      uploadImage({
        public_id: PUBLIC_ID_6,
        tags: UPLOAD_TAGS,
        context: `${contextKey}=alt-test`,
        eager: [EXPLICIT_TRANSFORMATION]
      })
    ]);
  });
  after(function () {
    var config = cloudinary.config(true);
    this.timeout(TIMEOUT.LONG);
    if (config.keep_test_products) {
      return Promise.resolve();
    }
    if (!(config.api_key && config.api_secret)) {
      expect().fail("Missing key and secret. Please set CLD_MEDIA_MANAGEMENT.");
    }
    return Q.allSettled([
      cloudinary.api.deleteMetadataField(METADATA_EXTERNAL_ID),
      cloudinary.api.deleteResourcesByTag(TEST_TAG)
    ]);
  });

  describe("resources", function () {
    callReusableTest("a list with a cursor", cloudinary.api.resources);
    callReusableTest("a list with a cursor", cloudinary.api.resourcesByTag, TEST_TAG);


    it("should allow listing resource_types", function () {
      this.timeout(TIMEOUT.MEDIUM);
      return cloudinary.api.resourceTypes().then(function (result) {
        expect(result.resource_types).to.contain("image");
      });
    });
    it("Should successfully return api callback result", function () {
      cloudinary.api.resources((err, res) => {
        expect(res).to.not.eql(undefined)
      })
    });
    it("should allow listing resources", function () {
      var publicId;
      this.timeout(TIMEOUT.MEDIUM);
      publicId = '';
      return uploadImage({
        tags: UPLOAD_TAGS
      }).then(function (result) {
        publicId = result.public_id;
        return cloudinary.api.resources();
      }).then(function (result) {
        let resource = findByAttr(result.resources, "public_id", publicId);
        expect(resource).not.to.eql(void 0);
        expect(resource.type).to.eql("upload");
      });
    });
    it("should allow listing resources with metadata", async function () {
      this.timeout(TIMEOUT.MEDIUM);
      await retry(async function() {
        let result = await cloudinary.api.resources({
          type: "upload",
          prefix: PUBLIC_ID,
          metadata: true
        });
        result.resources.forEach((resource) => {
          expect(resource).to.have.property('metadata');
        });
        result = await cloudinary.api.resources({
          type: "upload",
          prefix: PUBLIC_ID,
          metadata: false
        });
        result.resources.forEach((resource) => {
          expect(resource).to.not.have.property('metadata');
        });
      });
    });
    it("should allow listing resources by tag with metadata", async function () {
      this.timeout(TIMEOUT.MEDIUM);
      await retry(async function() {
        let result = await cloudinary.api.resourcesByTag(TEST_TAG, {
          metadata: true
        });
        result.resources.forEach((resource) => {
          expect(resource).to.have.property('metadata');
        });
        result = await cloudinary.api.resourcesByTag(TEST_TAG, {
          metadata: false
        });
        result.resources.forEach((resource) => {
          expect(resource).to.not.have.property('metadata');
        });
      });
    });
    it("should allow listing resources by context with metadata", async function () {
      this.timeout(TIMEOUT.MEDIUM);
      await retry(async function() {
        let result = await cloudinary.api.resourcesByContext(contextKey, null, {
          metadata: true
        });
        result.resources.forEach((resource) => {
          expect(resource).to.have.property('metadata');
        });
        result = await cloudinary.api.resourcesByContext(contextKey, null, {
          metadata: false
        });
        result.resources.forEach((resource) => {
          expect(resource).to.not.have.property('metadata');
        });
      });
    });
    it("should allow listing resources by moderation with metadata", async function () {
      this.timeout(TIMEOUT.MEDIUM);
      const moderation = "manual";
      const status = "pending";
      await uploadImage({
        moderation,
        tags: [TEST_TAG]
      });
      let result = await cloudinary.api.resourcesByModeration(moderation, status, {
        metadata: true
      });
      result.resources.forEach((resource) => {
        expect(resource).to.have.property('metadata');
      });
      result = await cloudinary.api.resourcesByModeration(moderation, status, {
        metadata: false
      });
      result.resources.forEach((resource) => {
        expect(resource).to.not.have.property('metadata');
      });
    });
    it("should allow listing resources by type", function () {
      this.timeout(TIMEOUT.MEDIUM);
      return uploadImage({
        tags: UPLOAD_TAGS
      }).then(
        ({ public_id }) => cloudinary.api.resources({ type: "upload" })
          .then(result => [public_id, result])
          .then(([resources_public_id, result]) => {
            let resource = findByAttr(result.resources, "public_id", resources_public_id);
            expect(resource).to.be.an(Object);
            expect(resource.type).to.eql("upload");
          }));
    });
    it("should allow listing resources by prefix", function () {
      this.timeout(TIMEOUT.MEDIUM);
      return cloudinary.api.resources({
        type: "upload",
        prefix: PUBLIC_ID_PREFIX,
        max_results: 500
      }).then(function (result) {
        let public_ids = result.resources.map(resource => resource.public_id);

        public_ids.forEach((id) => {
          expect(id.indexOf(PUBLIC_ID_PREFIX)).to.be(0)
        });
      });
    });

    it("should allow listing resources by tag", function () {
      this.timeout(TIMEOUT.MEDIUM);
      return cloudinary.api.resourcesByTag(TEST_TAG, {
        context: true,
        tags: true,
        max_results: 500
      }).then((result) => {
        expect(result.resources.map(e => e.public_id))
          .to.contain(PUBLIC_ID).and.contain(PUBLIC_ID_2);
        expect(getAllTags(result)).to.contain(TEST_TAG);
        expect(result.resources.map(e => e.context && e.context.custom.key))
          .to.contain("value");
      });
    });
    it("should allow listing resources by context only", function () {
      this.timeout(TIMEOUT.MEDIUM);
      return cloudinary.api.resourcesByContext(contextKey, null)
        .then(result => expect(result.resources).to.have.length(2));
    });
    it("should allow listing resources by context key and value", function () {
      this.timeout(TIMEOUT.MEDIUM);
      return cloudinary.api.resourcesByContext(contextKey, "test").then(function (result) {
        expect(result.resources).to.have.length(1);
      });
    });
    it("should allow get resource details by asset id", async () => {
      const { asset_id } = await uploadImage({tags: TEST_TAG})
      const resource = await API_V2.resourceByAssetId(asset_id)
      expect(resource).not.to.be.empty();
      expect(resource.asset_id).to.equal(asset_id);
      expect(resource).not.to.have.property('accessibility_analysis');
      expect(resource).not.to.have.property('colors');
      expect(resource).not.to.have.property('faces');
    });
    it('should allow listing resources by asset ids', async () => {
      this.timeout(TIMEOUT.MEDIUM);
      const uploads = await Promise.all([uploadImage({tags: TEST_TAG}), uploadImage({tags: TEST_TAG})]);
      const assetIds = uploads.map(item => item.asset_id);
      const publicIds = uploads.map(item => item.public_id);
      const { resources } = await API_V2.resourcesByAssetIds(assetIds);
      expect(resources).not.to.be.empty();
      expect(resources.length).to.eql(2);
      expect(publicIds).to.contain(resources[0].public_id);
      expect(publicIds).to.contain(resources[1].public_id);
    });
    it("should allow listing resources by public ids", function () {
      this.timeout(TIMEOUT.MEDIUM);
      return cloudinary.api.resourcesByIds([PUBLIC_ID, PUBLIC_ID_2], {
        context: true,
        tags: true
      }).then((result) => {
        expect(result.resources.map(e => e.public_id).sort()).to.eql([PUBLIC_ID, PUBLIC_ID_2]);
        expect(getAllTags(result)).to.contain(TEST_TAG);
        expect(result.resources.map(e => e.context.custom.key)).to.contain("value");
      });
    });
    it("should allow listing resources specifying direction", function () {
      this.timeout(TIMEOUT.LONG);
      Q.all(
        cloudinary.api.resourcesByTag(TEST_TAG, {
          type: "upload",
          max_results: 500,
          direction: "asc"
        }),
        cloudinary.api.resourcesByTag(TEST_TAG, {
          type: "upload",
          max_results: 500,
          direction: "desc"
        })
      ).then(([resultAsc, resultDesc]) => [
        resultAsc.resources.map(r => r.public_id),
        resultDesc.resources.map(r => r.public_id)
      ]).then(([asc, desc]) => expect(asc.reverse()).to.eql(desc));
    });
    it("should allow listing resources by start_at", function () {
      let start_at = new Date().toString();
      helper.provideMockObjects((mockXHR, writeSpy, requestSpy) => {
        cloudinary.api.resources({
          type: "upload",
          start_at: start_at,
          direction: "asc"
        });
        sinon.assert.calledWith(requestSpy, sinon.match({
          query: sinon.match(`start_at=${encodeURIComponent(start_at)}`)
        }));
      });
    });
    it("should allow get resource metadata", function () {
      this.timeout(TIMEOUT.LONG);
      return uploadImage({
        tags: UPLOAD_TAGS,
        eager: [EXPLICIT_TRANSFORMATION]
      }).then(({ public_id }) => cloudinary.api.resource(public_id)
        .then(resource => [public_id, resource]))
        .then(([public_id, resource]) => {
          expect(resource).not.to.eql(void 0);
          expect(resource.public_id).to.eql(public_id);
          expect(resource.bytes).to.eql(3381);
          expect(resource.derived).to.have.length(1);
        });
    });
    it("should allow getting the cinemagraph_analysis of a resource", async function () {
      // Get a resource and include a cinemagraph analysis value in the response
      const result = await API_V2.resource(PUBLIC_ID, { cinemagraph_analysis: true });

      // Ensure result includes a cinemagraph_analysis with a cinemagraph_score
      expect(result).not.to.be.empty();
      expect(result.cinemagraph_analysis).to.be.an("object");
      expect(result.cinemagraph_analysis).to.have.property("cinemagraph_score");
    });
    describe("derived pagination", function(){
      it("should send the derived_next_cursor to the server", function() {
        return helper.provideMockObjects((mockXHR, writeSpy, requestSpy) => {
          cloudinary.api.resource(PUBLIC_ID, {derived_next_cursor: 'aaa'});
          return sinon.assert.calledWith(
            requestSpy, sinon.match(sinon.match({
              query: sinon.match('derived_next_cursor=aaa')
            }, 'derived_next_cursor=aaa')));
        });
      });
    });
    it("should send `accessibility_analysis` param to the server", function () {
      return helper.provideMockObjects((mockXHR, writeSpy, requestSpy) => {
        cloudinary.api.resource(PUBLIC_ID, { accessibility_analysis: true });
        return sinon.assert.calledWith(requestSpy, sinon.match({
          query: sinon.match(helper.apiParamMatcher("accessibility_analysis", "true"))
        }));
      });
    });
  });
  describe("backup resource", function () {
    this.timeout(TIMEOUT.MEDIUM);

    const publicId = "api_test_backup" + UNIQUE_JOB_SUFFIX_ID;
    before(() => uploadImage({
      public_id: publicId,
      backup: true
    }).then(() => cloudinary.api.resource(publicId)).then((resource) => {
      expect(resource).not.to.be(null);
    }));
    after(function () {
      return cloudinary.api.deleteResources(publicId).then((response) => {
        expect(response).to.have.property("deleted");
      });
    });
    it("should return the asset details together with all of its backed up versions when versions is true", function () {
      return cloudinary.api.resource(publicId, { versions: true })
        .then((resource) => {
          expect(resource.versions).to.be.an('array');
        });
    });

    it("should return the asset details together without backed up versions when versions is false", function () {
      return cloudinary.api.resource(publicId, { versions: false })
        .then((resource) => {
          expect(resource.versions).to.be(undefined);
        });
    });
  });
  describe("delete", function () {
    it("should allow deleting resources", function () {
      this.timeout(TIMEOUT.MEDIUM);
      return uploadImage({
        public_id: PUBLIC_ID_3,
        tags: UPLOAD_TAGS
      }).then(
        () => cloudinary.api.resource(PUBLIC_ID_3)
      ).then(function (resource) {
        expect(resource).not.to.eql(void 0);
        return cloudinary.api.deleteResources(["apit_test", PUBLIC_ID_2, PUBLIC_ID_3]);
      }).then(
        () => cloudinary.api.resource(PUBLIC_ID_3)
      ).then(() => {
        expect().fail();
      }).catch(function ({ error }) {
        expect(error).to.be.an(Object);
        expect(error.http_code).to.eql(404);
      });
    });
    describe("delete_resources_by_prefix", function () {
      callReusableTest("accepts next_cursor", cloudinary.api.deleteResourcesByPrefix, "prefix_foobar");
      return it("should allow deleting resources by prefix", function () {
        this.timeout(TIMEOUT.MEDIUM);
        return uploadImage({
          public_id: "api_test_by_prefix",
          tags: UPLOAD_TAGS
        }).then(
          () => cloudinary.api.resource("api_test_by_prefix")
        ).then(function (resource) {
          expect(resource).not.to.eql(void 0);
          return cloudinary.api.deleteResourcesByPrefix("api_test_by");
        }).then(
          () => cloudinary.api.resource("api_test_by_prefix")
        ).then(
          () => expect().fail()
        ).catch(function ({ error }) {
          expect(error).to.be.an(Object);
          expect(error.http_code).to.eql(404);
        });
      });
    });
    describe("delete_resources_by_tag", function () {
      let deleteTestTag = TEST_TAG + "_delete";
      callReusableTest("accepts next_cursor", cloudinary.api.deleteResourcesByPrefix, deleteTestTag);
      it("should allow deleting resources by tags", function () {
        this.timeout(TIMEOUT.MEDIUM);
        return uploadImage({
          public_id: PUBLIC_ID_4,
          tags: UPLOAD_TAGS.concat([deleteTestTag])
        }).then(
          () => cloudinary.api.resource(PUBLIC_ID_4)
        ).then(function (resource) {
          expect(resource).to.be.ok();
          return cloudinary.api.deleteResourcesByTag(deleteTestTag);
        }).then(
          () => cloudinary.api.resource(PUBLIC_ID_4)
        ).then(
          () => expect().fail()
        ).catch(({ error }) => {
          expect(error).to.be.an(Object);
          expect(error.http_code).to.eql(404);
        });
      });
    });
  });
  describe("tags", function () {
    callReusableTest("a list with a cursor", cloudinary.api.tags);
    it("should allow listing tags", function () {
      this.timeout(TIMEOUT.MEDIUM);
      return cloudinary.api.tags({
        max_results: 500
      }).then(result => expect(result.tags).not.to.be.empty());
    });
    it("should allow listing tag by prefix ", function () {
      this.timeout(TIMEOUT.MEDIUM);
      return cloudinary.api.tags({
        prefix: TEST_TAG.slice(0, -1),
        max_results: 500
      }).then(result => expect(result.tags).to.contain(TEST_TAG));
    });
    it("should allow listing tag by prefix if not found", function () {
      this.timeout(TIMEOUT.MEDIUM);
      return cloudinary.api.tags({
        prefix: "api_test_no_such_tag"
      }).then(result => expect(result.tags).to.be.empty());
    });
  });
  describe("headers", function () {
    it("should include rate limits", function () {
      this.timeout(TIMEOUT.MEDIUM);
      return cloudinary.api.resources().then(function (result) {
        expect(result.rate_limit_allowed).to.be.a("number");
        expect(result.rate_limit_reset_at).to.be.an("object");
        expect(result.rate_limit_reset_at).to.have.property("getDate");
        expect(result.rate_limit_remaining).to.be.a("number");

        expect(result.rate_limit_allowed).to.be.above(0);
        expect(result.rate_limit_remaining).to.be.above(0);
        expect(result.rate_limit_reset_at).to.be.above(0);
      });
    });
  });
  it("should support the usage API call", function () {
    this.timeout(TIMEOUT.MEDIUM);
    return cloudinary.api.usage()
      .then(usage => {
        expect(usage).to.be.an("object");
        expect(usage).to.have.keys("plan", "last_updated", "transformations", "objects", "bandwidth", "storage", "requests", "resources", "derived_resources", "media_limits");
      });
  });
  it("should return usage values for a specific date", function () {
    const yesterday = formatDate(subDate(new Date(), { days: 1 }), "dd-MM-yyyy");
    return cloudinary.api.usage({ date: yesterday })
      .then(usage => {
        expect(usage).to.be.an("object");
        expect(usage).to.have.keys("plan", "last_updated", "transformations", "objects", "bandwidth", "storage", "requests", "resources", "derived_resources", "media_limits");
        expect(usage.bandwidth).to.be.an("object");
        expect(usage.bandwidth).to.not.have.keys("limit", "used_percent");
      });
  });
  describe("delete_all_resources", function () {
    callReusableTest("accepts next_cursor", cloudinary.api.deleteAllResources);
  });
  describe("update", function () {
    describe("notification url", function () {
      var writeSpy, xhr;
      before(function () {
        xhr = sinon.useFakeXMLHttpRequest();
        writeSpy = sinon.spy(ClientRequest.prototype, 'write');
      });
      after(function () {
        writeSpy.restore();
        xhr.restore();
      });
      it("should support changing moderation status with notification-url", function () {
        this.timeout(TIMEOUT.LONG);
        return uploadImage({
          moderation: "manual"
        }).then(upload_result => cloudinary.api.update(upload_result.public_id, {
          moderation_status: "approved",
          notification_url: "http://example.com"
        })).then(function () {
          if (writeSpy.called) {
            sinon.assert.calledWith(writeSpy, sinon.match(/notification_url=http%3A%2F%2Fexample.com/));
            sinon.assert.calledWith(writeSpy, sinon.match(/moderation_status=approved/));
          }
        });
      });
    });
    describe("quality override", function() {
      const mocked = helper.mockTest();
      const qualityValues = ["auto:advanced", "auto:best", "80:420", "none"];
      qualityValues.forEach(quality => {
        it("should support '" + quality + "' in update", function() {
          cloudinary.api.update("sample", {quality_override: quality});
          sinon.assert.calledWith(mocked.write, sinon.match(helper.apiParamMatcher("quality_override", quality)));
        });
      });
    });
    // describe(":ocr", function () {
    //   before(async function () {
    //     this.timeout(TIMEOUT.MEDIUM);
    //     await retry(async function() {
    //       await uploadImage({
    //         public_id: PUBLIC_ID_OCR_1,
    //         tags: [TEST_TAG]
    //       });
    //     });
    //   });
    //   it("should support requesting ocr when updating", async function () {
    //     if (!shouldTestAddOn(ADDON_OCR)) {
    //       this.skip();
    //     }
    //     // Update an image with ocr parameter
    //     const ocrType = "adv_ocr";
    //     const updateResult = await API_V2.update(PUBLIC_ID_OCR_1, { ocr: ocrType });
    //
    //     // Ensure result includes a ocr with correct value
    //     expect(updateResult).not.to.be.empty();
    //     expect(updateResult.info).to.be.an("object");
    //     expect(updateResult.info.ocr).to.be.an("object");
    //     expect(updateResult.info.ocr).to.have.property(ocrType);
    //   });
    //   it("should return 'Illegal value' errors for unknown ocr types", function () {
    //     if (!shouldTestAddOn(ADDON_OCR)) {
    //       this.skip();
    //     }
    //     this.timeout(TIMEOUT.MEDIUM);
    //     return API_V2.update(PUBLIC_ID_OCR_1, {ocr: 'illegal'})
    //       .then(
    //         () => expect().fail()
    //       ).catch(({ error }) => expect(error.message).to.contain("Illegal value"));
    //   });
    // });
    it("should support setting manual moderation status", function() {
      this.timeout(TIMEOUT.LONG);
      return uploadImage({
        moderation: "manual"
      }).then(upload_result => cloudinary.api.update(upload_result.public_id, {
        moderation_status: "approved"
      })).then(api_result => expect(api_result.moderation[0].status).to.eql("approved"))
        .catch((err) => expect().fail(err));
    });
    it("should support requesting raw conversion", function () {
      this.timeout(TIMEOUT.MEDIUM);
      return uploadImage()
        .then(upload_result => cloudinary.api.update(upload_result.public_id, {
          raw_convert: "illegal"
        })).then(
          () => expect().fail()
        ).catch(({ error }) => expect(error.message).to.contain("Illegal value"));
    });
    it("should support requesting categorization", function () {
      this.timeout(TIMEOUT.MEDIUM);
      return uploadImage().then(function (upload_result) {
        return cloudinary.api.update(upload_result.public_id, {
          categorization: "illegal"
        });
      }).then(() => {
        expect().fail();
      }).catch(function ({ error }) {
        expect(error.message).to.contain("Illegal value");
      });
    });
    it("should support requesting detection", function () {
      this.timeout(TIMEOUT.MEDIUM);
      return uploadImage()
        .then(upload_result => cloudinary.api.update(upload_result.public_id, {
          detection: "illegal"
        })).then(
          () => expect().fail()
        ).catch(({ error }) => expect(error.message).to.contain("Illegal value"));
    });
    it("should support requesting background_removal", function () {
      this.timeout(TIMEOUT.MEDIUM);
      return uploadImage()
        .then(upload_result => cloudinary.api.update(upload_result.public_id, {
          background_removal: "illegal"
        })).then(
          () => expect().fail()
        ).catch(({ error }) => expect(error.message).to.contain("Illegal value"));
    });
    describe("access_control", function () {
      var acl, acl_string, options;
      acl = {
        access_type: 'anonymous',
        start: new Date(Date.UTC(2019, 1, 22, 16, 20, 57)),
        end: '2019-03-22 00:00 +0200'
      };
      acl_string = '{"access_type":"anonymous","start":"2019-02-22T16:20:57.000Z","end":"2019-03-22 00:00 +0200"}';
      options = {
        public_id: TEST_TAG,
        tags: [...UPLOAD_TAGS, 'access_control_test']
      };
      it("should allow the user to define ACL in the update parameters2", function () {
        return helper.provideMockObjects((mockXHR, writeSpy, requestSpy) => {
          options.access_control = [acl];
          cloudinary.api.update("id", options);
          return sinon.assert.calledWith(
            writeSpy, sinon.match(arg => helper.apiParamMatcher('access_control', `[${acl_string}]`)(arg))
          );
        });
      });
    });
  });
  it("should support listing by moderation kind and value", function () {
    callReusableTest("a list with a cursor", cloudinary.api.resourcesByModeration, "manual", "approved");
    return helper.provideMockObjects((mockXHR, writeSpy, requestSpy) => ["approved", "pending", "rejected"].forEach((stat) => {
      var status, status2;
      status = stat;
      status2 = status;
      requestSpy.resetHistory();
      cloudinary.api.resourcesByModeration("manual", status2, {
        moderations: true
      });
      sinon.assert.calledWith(requestSpy, sinon.match(
        arg => new RegExp(`/resources/image/moderations/manual/${status2}$`).test(arg != null ? arg.pathname : void 0), `/resources/image/moderations/manual/${status}`
      ));
      sinon.assert.calledWith(requestSpy, sinon.match(
        arg => (arg != null ? arg.query : void 0) === "moderations=true", "moderations=true"
      ));
    }));
  });
  describe("folders", function () {
    // For this test to work, "Auto-create folders" should be enabled in the Upload Settings.
    // Replace `it` with  `it.skip` below if you want to disable it.
    it("should list folders in cloudinary", function () {
      this.timeout(TIMEOUT.LONG);
      return Q.all([
        uploadImage({
          public_id: 'test_folder1/item',
          tags: UPLOAD_TAGS
        }),
        uploadImage({
          public_id: 'test_folder2/item',
          tags: UPLOAD_TAGS
        }),
        uploadImage({
          public_id: 'test_folder2/item',
          tags: UPLOAD_TAGS
        }),
        uploadImage({
          public_id: 'test_folder1/test_subfolder1/item',
          tags: UPLOAD_TAGS
        }),
        uploadImage({
          public_id: 'test_folder1/test_subfolder2/item',
          tags: UPLOAD_TAGS
        })
      ]).then(wait(TIMEOUT.SHORT))
        .then(function (results) {
          return Q.all([cloudinary.api.rootFolders(), cloudinary.api.subFolders('test_folder1')]);
        }).then(function (results) {
          var folder, root, root_folders, sub_1;
          root = results[0];
          root_folders = (() => {
            var j, len, ref, results1;
            ref = root.folders;
            results1 = [];
            for (j = 0, len = ref.length; j < len; j++) {
              folder = ref[j];
              results1.push(folder.name);
            }
            return results1;
          })();
          sub_1 = results[1];
          expect(root_folders).to.contain('test_folder1');
          expect(root_folders).to.contain('test_folder2');
          expect(sub_1.folders[0].path).to.eql('test_folder1/test_subfolder1');
          expect(sub_1.folders[1].path).to.eql('test_folder1/test_subfolder2');
          return cloudinary.api.subFolders('test_folder_not_exists');
        }).then(wait(TIMEOUT.LONG)).then((result) => {
          console.log('error test_folder_not_exists should not pass to "then" handler but "catch"');
          expect().fail('error test_folder_not_exists should not pass to "then" handler but "catch"');
        }).catch(({ error }) => expect(error.message).to.eql('Can\'t find folder with path test_folder_not_exists'));
    });
    describe("create_folder", function () {
      it("should create a new folder", function () {
        const folderPath = `${UNIQUE_TEST_FOLDER}`;
        const expectedPath = `folders/${folderPath}`;
        return helper.provideMockObjects(function (mockXHR, writeSpy, requestSpy) {
          cloudinary.api.createFolder(folderPath);
          sinon.assert.calledWith(requestSpy, sinon.match({
            pathname: sinon.match(expectedPath),
            method: sinon.match("POST")
          }));
        });
      });
    });
    describe("delete_folder", function () {
      this.timeout(TIMEOUT.MEDIUM);
      const folderPath = "test_folder/delete_folder/" + TEST_TAG;
      before(function () {
        return uploadImage({
          folder: folderPath,
          tags: UPLOAD_TAGS
        }).delay(2 * 1000).then(function () {
          return cloudinary.api.deleteResourcesByPrefix(folderPath)
            .then(() => cloudinary.api.subFolders(folderPath).then(folder => {
              expect(folder).not.to.be(null);
              expect(folder.total_count).to.eql(0);
              expect(folder.folders).to.be.empty;
            }));
        });
      });
      it('should delete an empty folder', function () {
        this.timeout(TIMEOUT.MEDIUM);
        return cloudinary.api.deleteFolder(
          folderPath
        ).delay(2 * 1000).then(() => cloudinary.api.subFolders(folderPath)
        ).then(() => expect().fail()
        ).catch(({error}) => expect(error.message).to.contain("Can't find folder with path"));
      });
    });
    describe("root_folders", function () {
      callReusableTest("a list with a cursor", cloudinary.api.rootFolders);
    })
    describe("sub_folders", function () {
      callReusableTest("a list with a cursor", cloudinary.api.subFolders, '/');
    });
  });
  describe('.restore', function () {
    this.timeout(TIMEOUT.MEDIUM);

    const publicId = "api_test_restore" + UNIQUE_JOB_SUFFIX_ID;
    before(() => uploadImage({
      public_id: publicId,
      backup: true,
      tags: UPLOAD_TAGS
    }).then(wait(2000)).then(() => cloudinary.api.resource(publicId)).then((resource) => {
      expect(resource).not.to.be(null);
      expect(resource.bytes).to.eql(3381);
      return cloudinary.api.deleteResources(publicId);
    }).then(() => cloudinary.api.resource(publicId)).then((resource) => {
      expect(resource).not.to.be(null);
      expect(resource.bytes).to.eql(0);
      expect(resource.placeholder).to.eql(true);
    }));
    it('should restore a deleted resource', () => cloudinary.api.restore(publicId).then((response) => {
      let info = response[publicId];
      expect(info).not.to.be(null);
      expect(info.bytes).to.eql(3381);
      return cloudinary.api.resource(publicId);
    }).then((resource) => {
      expect(resource).not.to.be(null);
      expect(resource.bytes).to.eql(3381);
    }));

    it('should restore different versions of a deleted asset', async function () {
      this.timeout(TIMEOUT.LARGE);

      // Upload the same file twice (upload->delete->upload->delete)

      // Upload and delete a file
      const firstUpload = await uploadImage({ public_id: PUBLIC_ID_BACKUP_1, backup: true });
      await wait(1000)();

      const firstDelete = await API_V2.deleteResources([PUBLIC_ID_BACKUP_1]);


      // Upload and delete it again, this time add angle to create a different 'version'
      const secondUpload = await uploadImage({ public_id: PUBLIC_ID_BACKUP_1, backup: true, angle: '0'});
      await wait(1000)();

      const secondDelete = await API_V2.deleteResources([PUBLIC_ID_BACKUP_1]);
      await wait(1000)();

      // Sanity, ensure these uploads are different before we continue
      expect(firstUpload.bytes).not.to.equal(secondUpload.bytes);

      // Ensure all files were uploaded correctly
      expect(firstUpload).not.to.be(null);
      expect(secondUpload).not.to.be(null);

      // Ensure all files were deleted correctly
      expect(firstDelete).to.have.property("deleted");
      expect(secondDelete).to.have.property("deleted");

      // Get the versions of the deleted asset
      const getVersionsResp = await API_V2.resource(PUBLIC_ID_BACKUP_1, { versions: true });

      const firstAssetVersion = getVersionsResp.versions[0].version_id;
      const secondAssetVersion = getVersionsResp.versions[1].version_id;

      // Restore first version, ensure it's equal to the upload size
      await wait(1000)();
      const firstVerRestore = await API_V2.restore([PUBLIC_ID_BACKUP_1], { versions: [firstAssetVersion] });
      expect(firstVerRestore[PUBLIC_ID_BACKUP_1].bytes).to.eql(firstUpload.bytes);

      // Restore second version, ensure it's equal to the upload size
      await wait(1000)();
      const secondVerRestore = await API_V2.restore([PUBLIC_ID_BACKUP_1], { versions: [secondAssetVersion] });
      expect(secondVerRestore[PUBLIC_ID_BACKUP_1].bytes).to.eql(secondUpload.bytes);

      // Cleanup,
      const finalDeleteResp = await API_V2.deleteResources([PUBLIC_ID_BACKUP_1]);
      expect(finalDeleteResp).to.have.property("deleted");
    });

    it('should restore two different deleted assets', async () => {
      // Upload two different files
      const firstUpload = await uploadImage({ public_id: PUBLIC_ID_BACKUP_1, backup: true });
      const secondUpload = await uploadImage({ public_id: PUBLIC_ID_BACKUP_2, backup: true, angle: '0' });

      // delete both resources
      const deleteAll = await API_V2.deleteResources([PUBLIC_ID_BACKUP_1, PUBLIC_ID_BACKUP_2]);

      // Expect correct deletion of the assets
      expect(deleteAll.deleted[PUBLIC_ID_BACKUP_1]).to.be("deleted");
      expect(deleteAll.deleted[PUBLIC_ID_BACKUP_2]).to.be("deleted");

      const getFirstAssetVersion = await API_V2.resource(PUBLIC_ID_BACKUP_1, { versions: true });
      const getSecondAssetVersion = await API_V2.resource(PUBLIC_ID_BACKUP_2, { versions: true });

      const firstAssetVersion = getFirstAssetVersion.versions[0].version_id;
      const secondAssetVersion = getSecondAssetVersion.versions[0].version_id;

      const IDS_TO_RESTORE = [PUBLIC_ID_BACKUP_1, PUBLIC_ID_BACKUP_2];
      const VERSIONS_TO_RESTORE = [firstAssetVersion, secondAssetVersion];

      const restore = await API_V2.restore(IDS_TO_RESTORE, { versions: VERSIONS_TO_RESTORE });

      // Expect correct restorations
      expect(restore[PUBLIC_ID_BACKUP_1].bytes).to.equal(firstUpload.bytes);
      expect(restore[PUBLIC_ID_BACKUP_2].bytes).to.equal(secondUpload.bytes);

      // Cleanup
      const finalDelete = await API_V2.deleteResources([PUBLIC_ID_BACKUP_1, PUBLIC_ID_BACKUP_2]);
      // Expect correct deletion of the assets
      expect(finalDelete.deleted[PUBLIC_ID_BACKUP_1]).to.be("deleted");
      expect(finalDelete.deleted[PUBLIC_ID_BACKUP_2]).to.be("deleted");
    });
  });
  describe('mapping', function () {
    before(function () {
      this.mapping = `api_test_upload_mapping${Math.floor(Math.random() * 100000)}`;
      this.deleteMapping = false;
    });
    after(function () {
      return this.deleteMapping ? cloudinary.api.deleteUploadMapping(this.mapping) : null;
    });
    callReusableTest("a list with a cursor", cloudinary.api.uploadMappings);
    it('should create mapping', function () {
      this.timeout(TIMEOUT.LONG);
      return cloudinary.api
        .createUploadMapping(this.mapping, {
          template: "http://cloudinary.com",
          tags: UPLOAD_TAGS
        }).then(
          () => cloudinary.api.uploadMapping(this.mapping)
        ).then((result) => {
          this.deleteMapping = true;
          expect(result.template).to.eql("http://cloudinary.com");
          return cloudinary.api.updateUploadMapping(this.mapping, {
            template: "http://res.cloudinary.com"
          });
        }).then(
          result => cloudinary.api.uploadMapping(this.mapping)
        ).then((result) => {
          expect(result.template).to.eql("http://res.cloudinary.com");
          return cloudinary.api.uploadMappings();
        }).then((result) => {
          expect(result.mappings.find(({ folder, template }) => folder === this.mapping && template === "http://res.cloudinary.com")).to.be.ok();
          return cloudinary.api.deleteUploadMapping(this.mapping);
        }).then((result) => {
          this.deleteMapping = false;
          return cloudinary.api.uploadMappings();
        }).then(
          ({ mappings }) => expect(mappings.find(({ folder }) => folder === this.mapping)).not.to.be.ok()
        );
    });
  });
  describe("proxy support", function () {
    const mocked = helper.mockTest();
    it("should support proxy for api calls", function () {
      cloudinary.config({api_proxy: "https://myuser:mypass@example.com"});
      cloudinary.api.resources({});
      sinon.assert.calledWith(mocked.request, sinon.match(
        arg => arg.agent instanceof ProxyAgent
      ));
    });
    it("should prioritize custom agent", function () {
      cloudinary.config({api_proxy: "https://myuser:mypass@example.com"});
      const custom_agent = https.Agent()
      cloudinary.api.resources({agent: custom_agent});
      sinon.assert.calledWith(mocked.request, sinon.match(
        arg => arg.agent === custom_agent
      ));
    });
    it("should support api_proxy as options key", function () {
      cloudinary.config({});
      cloudinary.api.resources({api_proxy: "https://myuser:mypass@example.com"});
      sinon.assert.calledWith(mocked.request, sinon.match(
        arg => arg.agent instanceof ProxyAgent
      ));
    });
  })
});
