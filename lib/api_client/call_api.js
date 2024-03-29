// eslint-disable-next-line import/order
const config = require("../config");
const utils = require("../utils");
const ensureOption = require('../utils/ensureOption').defaults(config());
const execute_request = require('./execute_request');
const {adapter} = require("../utils");

const { ensurePresenceOf } = utils;

function callApi(method, uri, params, options, _callback) {
  let callback = adapter(_callback, options);
  ensurePresenceOf({ method, uri });
  const api_url = utils.base_api_url(uri, options);
  let auth = {};
  if (options.oauth_token || config().oauth_token){
    auth = {
      oauth_token: ensureOption(options, "oauth_token")
    };
  } else {
    auth = {
      key: ensureOption(options, "api_key"),
      secret: ensureOption(options, "api_secret")
    };
  }
  return execute_request(method, params, auth, api_url, callback, options);
}

module.exports = callApi;
