const api = require('./api');
const {isEmpty, isNumber} = require('./utils');

const Search = class Search {
  constructor() {
    this.query_hash = {
      sort_by: [],
      aggregate: [],
      with_field: []
    };
  }

  static instance() {
    return new Search();
  }

  static expression(value) {
    return this.instance().expression(value);
  }

  static maxResults(value) {
    return this.instance().maxResults(value);
  }

  static nextCursor(value) {
    return this.instance().nextCursor(value);
  }

  static aggregate(value) {
    return this.instance().aggregate(value);
  }

  static withField(value) {
    return this.instance().withField(value);
  }

  static sortBy(field_name, dir = 'asc') {
    return this.instance().sortBy(field_name, dir);
  }

  expression(value) {
    this.query_hash.expression = value;
    return this;
  }

  maxResults(value) {
    this.query_hash.max_results = value;
    return this;
  }

  nextCursor(value) {
    this.query_hash.next_cursor = value;
    return this;
  }

  aggregate(value) {
    const found = this.query_hash.aggregate.find(v => v === value);

    if (!found) {
      this.query_hash.aggregate.push(value);
    }

    return this;
  }

  withField(value) {
    const found = this.query_hash.with_field.find(v => v === value);

    if (!found) {
      this.query_hash.with_field.push(value);
    }

    return this;
  }

  sortBy(field_name, dir = "desc") {
    let sort_bucket;
    sort_bucket = {};
    sort_bucket[field_name] = dir;

    // Check if this field name is already stored in the hash
    const previously_sorted_obj = this.query_hash.sort_by.find((sort_by) => sort_by[field_name]);

    // Since objects are references in Javascript, we can update the reference we found
    // For example,
    if (previously_sorted_obj) {
      previously_sorted_obj[field_name] = dir;
    } else {
      this.query_hash.sort_by.push(sort_bucket);
    }

    return this;
  }

  toQuery() {
    Object.keys(this.query_hash).forEach((k) => {
      let v = this.query_hash[k];
      if (!isNumber(v) && isEmpty(v)) {
        delete this.query_hash[k];
      }
    });
    return this.query_hash;
  }

  execute(options, callback) {
    if (callback === null) {
      callback = options;
    }
    options = options || {};
    return api.search(this.toQuery(), options, callback);
  }
};

module.exports = Search;
