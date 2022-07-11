const Q = require('q');
const cloudinary = require('../../../../cloudinary');
const helper = require("../../../spechelper");
const testConstants = require('../../../testUtils/testConstants');
const describe = require('../../../testUtils/suite');
const {
  TIMEOUT,
  TAGS,
  PUBLIC_IDS,
  UNIQUE_JOB_SUFFIX_ID
} = testConstants;

const {
  PUBLIC_ID_1,
  PUBLIC_ID_2,
  PUBLIC_ID_3
} = PUBLIC_IDS;

const {
  UPLOAD_TAGS
} = TAGS;

const SEARCH_TAG = 'npm_advanced_search_' + UNIQUE_JOB_SUFFIX_ID;


describe("search_api", function () {
  describe("unit", function () {
    it('should create empty json', function () {
      var query_hash = cloudinary.search.instance().toQuery();
      expect(query_hash).to.eql({});
    });
    it('should always return same object in fluent interface', function () {
      let instance = cloudinary.search.instance();
      [
        'expression',
        'sortBy',
        'maxResults',
        'nextCursor',
        'aggregate',
        'withField'
      ].forEach(method => expect(instance).to.eql(instance[method]('emptyarg')));
    });
    it('should add expression to query', function () {
      var query = cloudinary.search.expression('format:jpg').toQuery();
      expect(query).to.eql({
        expression: 'format:jpg'
      });
    });
    it('should add sort_by to query', function () {
      var query = cloudinary.search.sortBy('created_at', 'asc').sortBy('updated_at', 'desc').toQuery();
      expect(query).to.eql({
        sort_by: [
          {
            created_at: 'asc'
          },
          {
            updated_at: 'desc'
          }
        ]
      });
    });
    it('should add max_results to query', function () {
      var query = cloudinary.search.maxResults('format:jpg').toQuery();
      expect(query).to.eql({
        max_results: 'format:jpg'
      });
    });
    it('should add next_cursor to query', function () {
      var query = cloudinary.search.nextCursor('format:jpg').toQuery();
      expect(query).to.eql({
        next_cursor: 'format:jpg'
      });
    });
    it('should add aggregate arguments as array to query', function () {
      var query = cloudinary.search.aggregate('format').aggregate('size_category').toQuery();
      expect(query).to.eql({
        aggregate: ['format', 'size_category']
      });
    });
    it('should add with_field to query', function () {
      var query = cloudinary.search.withField('context').withField('tags').toQuery();
      expect(query).to.eql({
        with_field: ['context', 'tags']
      });
    });
  });
  describe("integration", function () {
    this.timeout(TIMEOUT.LONG);
    before(function () {
      return Q.allSettled([
        cloudinary.uploader.upload(helper.IMAGE_FILE,
          {
            public_id: PUBLIC_ID_1,
            tags: [...UPLOAD_TAGS,
              SEARCH_TAG],
            context: "stage=in_review"
          }),
        cloudinary.uploader.upload(helper.IMAGE_FILE,
          {
            public_id: PUBLIC_ID_2,
            tags: [...UPLOAD_TAGS,
              SEARCH_TAG],
            context: "stage=new"
          }),
        cloudinary.uploader.upload(helper.IMAGE_FILE,
          {
            public_id: PUBLIC_ID_3,
            tags: [...UPLOAD_TAGS,
              SEARCH_TAG],
            context: "stage=validated"
          })
      ]).delay(10000)
    });

    after(function () {
      if (!cloudinary.config().keep_test_products) {
        let config = cloudinary.config();

        cloudinary.api.deleteResourcesByTag(SEARCH_TAG);
      }
    });
    it(`should return all images tagged with ${SEARCH_TAG}`, function () {
      return cloudinary.search.expression(`tags:${SEARCH_TAG}`)
        .execute()
        .then(function (results) {
          expect(results.resources.length).to.eql(3);
        });
    });
    it(`should return resource ${PUBLIC_ID_1}`, function () {
      return cloudinary.search.expression(`public_id:${PUBLIC_ID_1}`)
        .execute()
        .then(function (results) {
          expect(results.resources.length).to.eql(1);
        });
    });
    it('should paginate resources limited by tag and orderd by ascing public_id', function () {
      return cloudinary.search.maxResults(1).expression(`tags:${SEARCH_TAG}`)
        .sortBy('public_id', 'asc')
        .execute().then(function (results) {
          expect(results.resources.length).to.eql(1);
          expect(results.resources[0].public_id).to.eql(PUBLIC_ID_1);
          expect(results.total_count).to.eql(3);
          return cloudinary.search.maxResults(1).expression(`tags:${SEARCH_TAG}`)
            .sortBy('public_id', 'asc')
            .nextCursor(results.next_cursor).execute();
        }).then(function (results) {
          expect(results.resources.length).to.eql(1);
          expect(results.resources[0].public_id).to.eql(PUBLIC_ID_2);
          expect(results.total_count).to.eql(3);
          return cloudinary.search.maxResults(1).expression(`tags:${SEARCH_TAG}`).sortBy('public_id', 'asc').nextCursor(results.next_cursor).execute();
        }).then(function (results) {
          expect(results.resources.length).to.eql(1);
          expect(results.resources[0].public_id).to.eql(PUBLIC_ID_3);
          expect(results.total_count).to.eql(3);
          expect(results).not.to.have.key('next_cursor');
        });
    });

    it('Should eliminate duplicate fields when using sort_by, aggregate or with_fields', function () {
      // This test ensures we can't push duplicate values into sort_by, aggregate or with_fields
      const search_query = cloudinary.search.maxResults(10).expression(`tags:${SEARCH_TAG}`)
        .sortBy('public_id', 'asc')
        .sortBy('public_id', 'asc')
        .sortBy('public_id', 'asc')
        .sortBy('public_id', 'asc')
        .sortBy('public_id', 'desc')
        .sortBy('public_id', 'desc')
        .aggregate('foo')
        .aggregate('foo')
        .aggregate('foo2')
        .withField('foo')
        .withField('foo')
        .withField('foo2')
        .toQuery();

      expect(search_query.aggregate.length).to.be(2);
      expect(search_query.with_field.length).to.be(2);
      expect(search_query.sort_by.length).to.be(1);

      expect(search_query.aggregate[0]).to.be('foo');
      expect(search_query.aggregate[1]).to.be('foo2');
      expect(search_query.with_field[0]).to.be('foo');
      expect(search_query.with_field[1]).to.be('foo2');

      expect(search_query.sort_by[0].public_id).to.be('desc');
    });

    it('should include context', function () {
      return cloudinary.search.expression(`tags:${SEARCH_TAG}`).withField('context')
        .execute()
        .then(function (results) {
          expect(results.resources.length).to.eql(3);
          results.resources.forEach(function (res) {
            expect(Object.keys(res.context)).to.eql(['stage']);
          });
        });
    });
    it('should include context, tags and image_metadata', function () {
      return cloudinary.search.expression(`tags:${SEARCH_TAG}`)
        .withField('context')
        .withField('tags')
        .withField('image_metadata')
        .execute()
        .then(function (results) {
          expect(results.resources.length).to.eql(3);
          results.resources.forEach(function (res) {
            expect(Object.keys(res.context)).to.eql(['stage']);
            expect(res.image_metadata).to.be.ok();
            expect(res.tags.length).to.eql(4);
          });
        });
    });
  });
});
