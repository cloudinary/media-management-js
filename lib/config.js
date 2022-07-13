/**
 * Assign a value to a nested object
 * @function putNestedValue
 * @param params the parent object - this argument will be modified!
 * @param key key in the form nested[innerkey]
 * @param value the value to assign
 * @return the modified params object
 */
const url = require('url');
const extend = require("lodash/extend");
const isObject = require("lodash/isObject");
const isString = require("lodash/isString");
const isUndefined = require("lodash/isUndefined");
const isEmpty = require("lodash/isEmpty");
const entries = require('./utils/entries');

let cloudinary_config = void 0;

/**
 * Sets a value in an object using a nested key
 * @param {object} params The object to assign the value in.
 * @param {string} key The key of the value. A period is used to denote inner keys.
 * @param {*} value The value to set.
 * @returns {object} The params argument.
 * @example
 *     let o = {foo: {bar: 1}};
 *     putNestedValue(o, 'foo.bar', 2); // {foo: {bar: 2}}
 *     putNestedValue(o, 'foo.inner.key', 'this creates an inner object');
 *     // {{foo: {bar: 2}, inner: {key: 'this creates an inner object'}}}
 */
function putNestedValue(params, key, value) {
  let chain = key.split(/[\[\]]+/).filter(i => i.length);
  let outer = params;
  let lastKey = chain.pop();
  for (let j = 0; j < chain.length; j++) {
    let innerKey = chain[j];
    let inner = outer[innerKey];
    if (inner == null) {
      inner = {};
      outer[innerKey] = inner;
    }
    outer = inner;
  }
  outer[lastKey] = value;
  return params;
}

function parseCloudinaryConfigFromEnvURL(ENV_STR) {
  let conf = {};

  let uri = url.parse(ENV_STR, true);

  if (uri.protocol === 'cloudinary:') {
    conf = Object.assign({}, conf, {
      cloud_name: uri.host,
      api_key: uri.auth && uri.auth.split(":")[0],
      api_secret: uri.auth && uri.auth.split(":")[1]
    });
  }

  return conf;
}

function extendCloudinaryConfigFromQuery(ENV_URL, confToExtend = {}) {
  let uri = url.parse(ENV_URL, true);
  if (uri.query != null) {
    entries(uri.query).forEach(([key, value]) => putNestedValue(confToExtend, key, value));
  }
}

function extendCloudinaryConfig(parsedConfig, confToExtend = {}) {
  entries(parsedConfig).forEach(([key, value]) => {
    if (value !== undefined) {
      confToExtend[key] = value;
    }
  });

  return confToExtend;
}

module.exports = function (new_config, new_value) {
  if ((cloudinary_config == null) || new_config === true) {
    if (cloudinary_config == null) {
      cloudinary_config = {};
    } else {
      Object.keys(cloudinary_config).forEach(key => delete cloudinary_config[key]);
    }

    let CLOUDINARY_ENV_URL = process.env.CLOUDINARY_URL;
    let CLOUDINARY_API_PROXY = process.env.CLOUDINARY_API_PROXY;

    if (CLOUDINARY_ENV_URL && !CLOUDINARY_ENV_URL.toLowerCase().startsWith('cloudinary://')) {
      throw new Error("Invalid CLOUDINARY_URL protocol. URL should begin with 'cloudinary://'");
    }
    if (!isEmpty(CLOUDINARY_API_PROXY)) {
      extendCloudinaryConfig({ api_proxy: CLOUDINARY_API_PROXY }, cloudinary_config);
    }
    if (CLOUDINARY_ENV_URL) {
      let parsedConfig = parseCloudinaryConfigFromEnvURL(CLOUDINARY_ENV_URL);
      extendCloudinaryConfig(parsedConfig, cloudinary_config);
      // Provide Query support in ENV url cloudinary://key:secret@test123?foo[bar]=value
      // expect(cloudinary_config.foo.bar).to.eql('value')
      extendCloudinaryConfigFromQuery(CLOUDINARY_ENV_URL, cloudinary_config);
    }
  }
  if (!isUndefined(new_value)) {
    cloudinary_config[new_config] = new_value;
  } else if (isString(new_config)) {
    return cloudinary_config[new_config];
  } else if (isObject(new_config)) {
    extend(cloudinary_config, new_config);
  }
  return cloudinary_config;
};
