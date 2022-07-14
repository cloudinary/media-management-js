const fs = require('fs');
const { extname, basename } = require('path');
const Q = require('q');
const Writable = require("stream").Writable;
const urlLib = require('url');
const adapter = require('./utils').adapter;

// eslint-disable-next-line import/order
const { upload_prefix } = require("./config")();

const isSecure = !(upload_prefix && upload_prefix.slice(0, 5) === 'http:');
const https = isSecure ? require('https') : require('http');

const utils = require("./utils");
const UploadStream = require('./upload_stream');
const config = require("./config");
const ProxyAgent = utils.optionalRequire('proxy-agent');
const ensureOption = require('./utils/ensureOption').defaults(config());

const {
  build_upload_params,
  extend,
  includes,
  isEmpty,
  isObject,
  isRemoteUrl
} = utils;

function uploadStream(options = {}, callback) {
  return upload(null, extend({
    stream: true
  }, options), callback);
}


function upload(file, options = {}, _callback) {
  let callback = adapter(_callback, options)
  return callApi("upload", options, function () {
    let params = build_upload_params(options);
    return isRemoteUrl(file) ? [params, { file: file }] : [params, {}, file];
  }, callback);
}

function uploadLarge(path, options = {}, callback) {
  if ((path != null) && isRemoteUrl(path)) {
    // upload a remote file
    return upload(path, options, callback);
  }
  if (path != null && !options.filename) {
    options.filename = path.split(/(\\|\/)/g).pop().replace(/\.[^/.]+$/, "");
  }
  return uploadChunked(path, extend({
    resource_type: 'raw'
  }, options), callback);
}

function uploadChunked(path, options, callback) {
  let file_reader = fs.createReadStream(path);
  let out_stream = uploadChunkedStream(options, callback);
  return file_reader.pipe(out_stream);
}

class Chunkable extends Writable {
  constructor(options) {
    super(options);
    this.chunk_size = options.chunk_size != null ? options.chunk_size : 20000000;
    this.buffer = Buffer.alloc(0);
    this.active = true;
    this.on('finish', () => {
      if (this.active) {
        this.emit('ready', this.buffer, true, function () {
        });
      }
    });
  }

  _write(data, encoding, done) {
    if (!this.active) {
      done();
    }
    if (this.buffer.length + data.length <= this.chunk_size) {
      this.buffer = Buffer.concat([this.buffer, data], this.buffer.length + data.length);
      done();
    } else {
      const grab = this.chunk_size - this.buffer.length;
      this.buffer = Buffer.concat([this.buffer, data.slice(0, grab)], this.buffer.length + grab);
      this.emit('ready', this.buffer, false, (active) => {
        this.active = active;
        if (this.active) {
          this.buffer = data.slice(grab);
          done();
        }
      });
    }
  }
}

function uploadLargeStream(_unused_, options = {}, callback) {
  return uploadChunkedStream(extend({
    resource_type: 'raw'
  }, options), callback);
}

function uploadChunkedStream(options = {}, _callback) {
  let callback = adapter(_callback, options)
  options = extend({}, options, {
    stream: true
  });
  options.x_unique_upload_id = utils.random_public_id();
  let params = build_upload_params(options);
  let chunk_size = options.chunk_size != null ? options.chunk_size : options.part_size;
  let chunker = new Chunkable({
    chunk_size: chunk_size
  });
  let sent = 0;
  chunker.on('ready', function (buffer, is_last, done) {
    let chunk_start = sent;
    sent += buffer.length;
    options.content_range = `bytes ${chunk_start}-${sent - 1}/${(is_last ? sent : -1)}`;
    params.timestamp = utils.timestamp();
    let finished_part = function (result) {
      const errorOrLast = (result.error != null) || is_last;
      if (errorOrLast && typeof callback === "function") {
        callback(result);
      }
      return done(!errorOrLast);
    };
    let stream = callApi("upload", options, function () {
      return [params, {}, buffer];
    }, finished_part);
    return stream.write(buffer, 'buffer', function () {
      return stream.end();
    });
  });
  return chunker;
}

function explicit(public_id, options = {}, callback) {
  return callApi("explicit", options, function () {
    return utils.build_explicit_api_params(public_id, options);
  }, callback);
}

// Creates a new archive in the server and returns information in JSON format
function createArchive(options = {}, target_format = null, callback) {
  return callApi("generate_archive", options, function () {
    let opt = utils.archive_params(options);
    if (target_format) {
      opt.target_format = target_format;
    }
    return [opt];
  }, callback);
}

// Creates a new zip archive in the server and returns information in JSON format
function createZip(options = {}, callback) {
  return createArchive(options, "zip", callback);
}

function destroy(public_id, options = {}, callback) {
  return callApi("destroy", options, function () {
    return [
      {
        timestamp: utils.timestamp(),
        type: options.type,
        invalidate: options.invalidate,
        public_id: public_id
      }
    ];
  }, callback);
}

function rename(from_public_id, to_public_id, options = {}, callback) {
  return callApi("rename", options, function () {
    return [
      {
        timestamp: utils.timestamp(),
        type: options.type,
        from_public_id: from_public_id,
        to_public_id: to_public_id,
        overwrite: options.overwrite,
        invalidate: options.invalidate,
        to_type: options.to_type
      }
    ];
  }, callback);
}

/**
 *
 * @param {String}          tag                  The tag or tags to assign. Can specify multiple
 *                                               tags in a single string, separated by commas - "t1,t2,t3,t4,t5,t6,t7,t8,t9,t10,t11".
 *
 * @param {Array}          public_ids           A list of public IDs (up to 1000) of assets uploaded to Cloudinary.
 *
 * @param {Function}        callback             Callback function
 *
 * @param {Object}          options              Configuration options may include 'exclusive' (boolean) which causes
 *                                               clearing this tag from all other resources
 * @return {Object}
 */
function addTag(tag, public_ids = [], options = {}, callback) {
  const exclusive = utils.option_consume("exclusive", options);
  const command = exclusive ? "set_exclusive" : "add";
  return callTagsApi(tag, command, public_ids, options, callback);
}


/**
 * @param {String}          tag                  The tag or tags to remove. Can specify multiple
 *                                               tags in a single string, separated by commas - "t1,t2,t3,t4,t5,t6,t7,t8,t9,t10,t11".
 *
 * @param {Array}          public_ids            A list of public IDs (up to 1000) of assets uploaded to Cloudinary.
 *
 * @param {Function}        callback             Callback function
 *
 * @param {Object}          options              Configuration options may include 'exclusive' (boolean) which causes
 *                                               clearing this tag from all other resources
 * @return {Object}
 */
function removeTag(tag, public_ids = [], options = {}, callback) {
  return callTagsApi(tag, "remove", public_ids, options, callback);
}

function removeAllTags(public_ids = [], options = {}, callback) {
  return callTagsApi(null, "remove_all", public_ids, options, callback);
}

function replaceTag(tag, public_ids = [], options = {}, callback) {
  return callTagsApi(tag, "replace", public_ids, options, callback);
}

function callTagsApi(tag, command, public_ids = [], options = {}, callback) {
  return callApi("tags", options, function () {
    let params = {
      timestamp: utils.timestamp(),
      public_ids: utils.build_array(public_ids),
      command: command,
      type: options.type
    };
    if (tag != null) {
      params.tag = tag;
    }
    return [params];
  }, callback);
}

function addContext(context, public_ids = [], options = {}, callback) {
  return callContextApi(context, 'add', public_ids, options, callback);
}

function removeAllContext(public_ids = [], options = {}, callback) {
  return callContextApi(null, 'remove_all', public_ids, options, callback);
}

function callContextApi(context, command, public_ids = [], options = {}, callback) {
  return callApi('context', options, function () {
    let params = {
      timestamp: utils.timestamp(),
      public_ids: utils.build_array(public_ids),
      command: command,
      type: options.type
    };
    if (context != null) {
      params.context = utils.encode_context(context);
    }
    return [params];
  }, callback);
}

function parseResult(buffer, res) {
  let result = '';
  try {
    result = JSON.parse(buffer);
    if (result.error && !result.error.name) {
      result.error.name = "Error";
    }
  } catch (jsonError) {
    result = {
      error: {
        message: `Server return invalid JSON response. Status Code ${res.statusCode}. ${jsonError}`,
        name: "Error"
      }
    };
  }
  return result;
}

function callApi(action, options, get_params, callback) {
  if (typeof callback !== "function") {
    callback = function () {};
  }
  const USE_PROMISES = !options.disable_promises;

  let deferred = Q.defer();
  if (options == null) {
    options = {};
  }
  let [params, unsigned_params, file] = get_params.call();
  params = utils.process_request_params(params, options);
  params = extend(params, unsigned_params);
  let api_url = utils.api_url(action, options);
  let boundary = utils.random_public_id();
  let errorRaised = false;
  let handle_response = function (res) {
    // let buffer;
    if (errorRaised) {

      // Already reported
    } else if (res.error) {
      errorRaised = true;

      if (USE_PROMISES) {
        deferred.reject(res);
      }
      callback(res);
    } else if (includes([200, 400, 401, 404, 420, 500], res.statusCode)) {
      let buffer = "";
      res.on("data", (d) => {
        buffer += d;
        return buffer;
      });
      res.on("end", () => {
        let result;
        if (errorRaised) {
          return;
        }
        result = parseResult(buffer, res);
        if (result.error) {
          result.error.http_code = res.statusCode;
          if (USE_PROMISES) {
            deferred.reject(result.error);
          }
        } else {
          if (USE_PROMISES) {
            deferred.resolve(result);
          }
        }
        callback(result);
      });
      res.on("error", (error) => {
        errorRaised = true;
        if (USE_PROMISES) {
          deferred.reject(error);
        }
        callback({ error });
      });
    } else {
      let error = {
        message: `Server returned unexpected status code - ${res.statusCode}`,
        http_code: res.statusCode,
        name: "UnexpectedResponse"
      };
      if (USE_PROMISES) {
        deferred.reject(error);
      }
      callback({ error });
    }
  };
  let post_data = utils.hashToParameters(params)
    .filter(([key, value]) => value != null)
    .map(
      ([key, value]) => Buffer.from(encodeFieldPart(boundary, key, value), 'utf8')
    );
  let result = post(api_url, post_data, boundary, file, handle_response, options);
  if (isObject(result)) {
    return result;
  }

  if (USE_PROMISES) {
    return deferred.promise;
  }
}

function post(url, post_data, boundary, file, callback, options) {
  let file_header;
  let finish_buffer = Buffer.from("--" + boundary + "--", 'ascii');
  let oauth_token = options.oauth_token || config().oauth_token;
  if ((file != null) || options.stream) {
    // eslint-disable-next-line no-nested-ternary
    let filename = options.stream ? options.filename ? options.filename : "file" : basename(file);
    file_header = Buffer.from(encodeFilePart(boundary, 'application/octet-stream', 'file', filename), 'binary');
  }
  let post_options = urlLib.parse(url);
  let headers = {
    'Content-Type': `multipart/form-data; boundary=${boundary}`,
    'User-Agent': utils.getUserAgent()
  };
  if (options.content_range != null) {
    headers['Content-Range'] = options.content_range;
  }
  if (options.x_unique_upload_id != null) {
    headers['X-Unique-Upload-Id'] = options.x_unique_upload_id;
  }
  if (oauth_token != null) {
    headers.Authorization = `Bearer ${oauth_token}`;
  }

  post_options = extend(post_options, {
    method: 'POST',
    headers: headers
  });
  if (options.agent != null) {
    post_options.agent = options.agent;
  }
  let proxy = options.api_proxy || config().api_proxy;
  if (!isEmpty(proxy)) {
    if (!post_options.agent) {
      if (ProxyAgent === null) {
        throw new Error("Proxy value is set, but `proxy-agent` is not installed, please install `proxy-agent` module.")
      }
      post_options.agent = new ProxyAgent(proxy);
    } else {
      console.warn("Proxy is set, but request uses a custom agent, proxy is ignored.");
    }
  }

  let post_request = https.request(post_options, callback);
  let upload_stream = new UploadStream({ boundary });
  upload_stream.pipe(post_request);
  let timeout = false;
  post_request.on("error", function (error) {
    if (timeout) {
      error = {
        message: "Request Timeout",
        http_code: 499,
        name: "TimeoutError"
      };
    }
    return callback({ error });
  });
  post_request.setTimeout(options.timeout != null ? options.timeout : 60000, function () {
    timeout = true;
    return post_request.abort();
  });
  post_data.forEach(postDatum => post_request.write(postDatum));
  if (options.stream) {
    post_request.write(file_header);
    return upload_stream;
  }
  if (file != null) {
    post_request.write(file_header);
    fs.createReadStream(file).on('error', function (error) {
      callback({
        error: error
      });
      return post_request.abort();
    }).pipe(upload_stream);
  } else {
    post_request.write(finish_buffer);
    post_request.end();
  }
  return true;
}

function encodeFieldPart(boundary, name, value) {
  return [
    `--${boundary}`,
    `Content-Disposition: form-data; name="${name}"`,
    '',
    value,
    ''
  ].join("\r\n");
}

function encodeFilePart(boundary, type, name, filename) {
  return [
    `--${boundary}`,
    `Content-Disposition: form-data; name="${name}"; filename="${filename}"`,
    `Content-Type: ${type}`,
    '',
    ''
  ].join("\r\n");
}

function uploadTagParams(options = {}) {
  let params = build_upload_params(options);
  params = utils.process_request_params(params, options);
  return JSON.stringify(params);
}

function uploadUrl(options = {}) {
  if (options.resource_type == null) {
    options.resource_type = "auto";
  }
  return utils.api_url("upload", options);
}

/**
 * Populates metadata fields with the given values. Existing values will be overwritten.
 *
 * @param {Object}   metadata   A list of custom metadata fields (by external_id) and the values to assign to each
 * @param {Array}    public_ids The public IDs of the resources to update
 * @param {Function} callback   Callback function
 * @param {Object}   options    Configuration options
 *
 * @return {Object}
 */
function updateMetadata(metadata, public_ids, options = {}, callback) {
  return callApi("metadata", options, function () {
    let params = {
      metadata: utils.encode_context(metadata),
      public_ids: utils.build_array(public_ids),
      timestamp: utils.timestamp(),
      type: options.type
    };
    return [params];
  }, callback);
}

module.exports = {
  uploadChunkedStream,
  uploadLargeStream,
  uploadChunked,
  uploadLarge,
  upload,
  uploadStream,
  rename,
  destroy,
  createZip,
  createArchive,
  explicit,
  callContextApi,
  removeAllContext,
  addContext,
  callTagsApi,
  replaceTag,
  removeAllTags,
  removeTag,
  addTag,
  updateMetadata,
  uploadUrl,
  uploadTagParams
};
