const utils = require("./utils");
const callApi = require("./api_client/call_api");

const { extend, pickOnlyExistingValues } = utils;

function deleteResourcesParams(options, params = {}) {
  return extend(params, pickOnlyExistingValues(options, "invalidate", "next_cursor"));
}

function getResourceParams(options) {
  return pickOnlyExistingValues(options, "cinemagraph_analysis", "colors", "derived_next_cursor", "faces", "image_metadata", "pages", "phash", "coordinates", "max_results", "versions", "accessibility_analysis");
}

exports.ping = function ping(options = {}, callback) {
  return callApi("get", ["ping"], {}, options, callback);
};

exports.usage = function usage(options = {}, callback) {
  const uri = ["usage"];

  if (options.date) {
    uri.push(options.date);
  }

  return callApi("get", uri, {}, options, callback);
};

exports.resourceTypes = function resourceTypes(options = {}, callback) {
  return callApi("get", ["resources"], {}, options, callback);
};

exports.resources = function resources(options = {}, callback) {
  let resource_type, type, uri;
  resource_type = options.resource_type || "image";
  type = options.type;
  uri = ["resources", resource_type];
  if (type != null) {
    uri.push(type);
  }
  if ((options.start_at != null) && Object.prototype.toString.call(options.start_at) === '[object Date]') {
    options.start_at = options.start_at.toUTCString();
  }
  return callApi("get", uri, pickOnlyExistingValues(options, "next_cursor", "max_results", "prefix", "tags", "context", "direction", "moderations", "start_at", "metadata"), options, callback);
};

exports.resourcesByTag = function resourcesByTag(tag, options = {}, callback) {
  let resource_type, uri;
  resource_type = options.resource_type || "image";
  uri = ["resources", resource_type, "tags", tag];
  return callApi("get", uri, pickOnlyExistingValues(options, "next_cursor", "max_results", "tags", "context", "direction", "moderations", "metadata"), options, callback);
};

exports.resourcesByContext = function resourcesByContext(key, value, options = {}, callback) {
  let params, resource_type, uri;
  resource_type = options.resource_type || "image";
  uri = ["resources", resource_type, "context"];
  params = pickOnlyExistingValues(options, "next_cursor", "max_results", "tags", "context", "direction", "moderations", "metadata");
  params.key = key;
  if (value != null) {
    params.value = value;
  }
  return callApi("get", uri, params, options, callback);
};

exports.resourcesByModeration = function resourcesByModeration(kind, status, options = {}, callback) {
  let resource_type, uri;
  resource_type = options.resource_type || "image";
  uri = ["resources", resource_type, "moderations", kind, status];
  return callApi("get", uri, pickOnlyExistingValues(options, "next_cursor", "max_results", "tags", "context", "direction", "moderations", "metadata"), options, callback);
};

exports.resourceByAssetId = function resourceByAssetId(asset_id, options = {}, callback) {
  const uri = ["resources", asset_id];
  return callApi("get", uri, getResourceParams(options), options, callback);
}

exports.resourcesByAssetIds = function resourcesByAssetIds(asset_ids, options = {}, callback) {
  let params, uri;
  uri = ["resources", "by_asset_ids"];
  params = pickOnlyExistingValues(options, "tags", "context", "moderations");
  params["asset_ids[]"] = asset_ids;
  return callApi("get", uri, params, options, callback);
}

exports.resourcesByIds = function resourcesByIds(public_ids, options = {}, callback) {
  let params, resource_type, type, uri;
  resource_type = options.resource_type || "image";
  type = options.type || "upload";
  uri = ["resources", resource_type, type];
  params = pickOnlyExistingValues(options, "tags", "context", "moderations");
  params["public_ids[]"] = public_ids;
  return callApi("get", uri, params, options, callback);
};

exports.resource = function resource(public_id, options = {}, callback) {
  let resource_type, type, uri;
  resource_type = options.resource_type || "image";
  type = options.type || "upload";
  uri = ["resources", resource_type, type, public_id];
  return callApi("get", uri, getResourceParams(options), options, callback);
};

exports.restore = function restore(public_ids, options = {}, callback) {
  options.content_type = 'json';
  let resource_type, type, uri;
  resource_type = options.resource_type || "image";
  type = options.type || "upload";
  uri = ["resources", resource_type, type, "restore"];
  return callApi("post", uri, {
    public_ids: public_ids,
    versions: options.versions
  }, options, callback);
};

exports.update = function update(public_id, options = {}, callback) {
  let params, resource_type, type, uri;
  resource_type = options.resource_type || "image";
  type = options.type || "upload";
  uri = ["resources", resource_type, type, public_id];
  params = utils.updateable_resource_params(options);
  if (options.moderation_status != null) {
    params.moderation_status = options.moderation_status;
  }
  return callApi("post", uri, params, options, callback);
};

exports.deleteResources = function deleteResources(public_ids, options = {}, callback) {
  let resource_type, type, uri;
  resource_type = options.resource_type || "image";
  type = options.type || "upload";
  uri = ["resources", resource_type, type];
  return callApi("delete", uri, deleteResourcesParams(options, {
    "public_ids[]": public_ids
  }), options, callback);
};

exports.deleteResourcesByPrefix = function deleteResourcesByPrefix(prefix, options = {}, callback) {
  let resource_type, type, uri;
  resource_type = options.resource_type || "image";
  type = options.type || "upload";
  uri = ["resources", resource_type, type];
  return callApi("delete", uri, deleteResourcesParams(options, {
    prefix: prefix
  }), options, callback);
};

exports.deleteResourcesByTag = function deleteResourcesByTag(tag, options = {}, callback) {
  let resource_type, uri;
  resource_type = options.resource_type || "image";
  uri = ["resources", resource_type, "tags", tag];
  return callApi("delete", uri, deleteResourcesParams(options), options, callback);
};

exports.deleteAllResources = function deleteAllResources(options = {}, callback) {
  let resource_type, type, uri;

  resource_type = options.resource_type || "image";
  type = options.type || "upload";
  uri = ["resources", resource_type, type];
  return callApi("delete", uri, deleteResourcesParams(options, {
    all: true
  }), options, callback);
};

exports.tags = function tags(options = {}, callback) {
  let resource_type, uri;
  resource_type = options.resource_type || "image";
  uri = ["tags", resource_type];
  return callApi("get", uri, pickOnlyExistingValues(options, "next_cursor", "max_results", "prefix"), options, callback);
};

exports.rootFolders = function rootFolders(options = {}, callback) {
  let uri, params;
  uri = ["folders"];
  params = pickOnlyExistingValues(options, "next_cursor", "max_results");
  return callApi("get", uri, params, options, callback);
};

exports.subFolders = function subFolders(path, options = {}, callback) {
  let uri, params;
  uri = ["folders", path];
  params = pickOnlyExistingValues(options, "next_cursor", "max_results");
  return callApi("get", uri, params, options, callback);
};

/**
 * Creates an empty folder
 *
 * @param {string}    path      The folder path to create
 * @param {function}  callback  Callback function
 * @param {object}    options   Configuration options
 * @returns {*}
 */
exports.createFolder = function createFolder(path, options = {}, callback) {
  let uri;
  uri = ["folders", path];
  return callApi("post", uri, {}, options, callback);
};

exports.deleteFolder = function deleteFolder(path, options = {}, callback) {
  let uri;
  uri = ["folders", path];
  return callApi("delete", uri, {}, options, callback);
};

exports.uploadMappings = function uploadMappings(options = {}, callback) {
  let params;
  params = pickOnlyExistingValues(options, "next_cursor", "max_results");
  return callApi("get", "upload_mappings", params, options, callback);
};

exports.uploadMapping = function uploadMapping(name, options = {}, callback) {
  if (name == null) {
    name = null;
  }
  return callApi("get", 'upload_mappings', {
    folder: name
  }, options, callback);
};

exports.deleteUploadMapping = function deleteUploadMapping(name, options = {}, callback) {
  return callApi("delete", 'upload_mappings', {
    folder: name
  }, options, callback);
};

exports.updateUploadMapping = function updateUploadMapping(name, options = {}, callback) {
  let params;
  params = pickOnlyExistingValues(options, "template");
  params.folder = name;
  return callApi("put", 'upload_mappings', params, options, callback);
};

exports.createUploadMapping = function createUploadMapping(name, options = {}, callback) {
  let params;
  params = pickOnlyExistingValues(options, "template");
  params.folder = name;
  return callApi("post", 'upload_mappings', params, options, callback);
};

function publishResource(byKey, value, options = {}, callback) {
  let params, resource_type, uri;
  params = pickOnlyExistingValues(options, "type", "invalidate", "overwrite");
  params[byKey] = value;
  resource_type = options.resource_type || "image";
  uri = ["resources", resource_type, "publish_resources"];
  options = extend({
    resource_type: resource_type
  }, options);
  return callApi("post", uri, params, options, callback);
}

exports.search = function search(params, options = {}, callback) {
  options.content_type = 'json';
  return callApi("post", "resources/search", params, options, callback);
};


/**
 * Creates a new metadata field definition
 *
 * @see https://cloudinary.com/documentation/admin_api#create_a_metadata_field
 *
 * @param {Object}   field    The field to add
 * @param {Function} callback Callback function
 * @param {Object}   options  Configuration options
 *
 * @return {Object}
 */
exports.addMetadataField = function addMetadataField(field, options = {}, callback) {
  const params = pickOnlyExistingValues(field, "external_id", "type", "label", "mandatory", "default_value", "validation", "datasource");
  options.content_type = "json";
  return callApi("post", ["metadata_fields"], params, options, callback);
};

/**
 * Returns a list of all metadata field definitions
 *
 * @see https://cloudinary.com/documentation/admin_api#get_metadata_fields
 *
 * @param {Function} callback Callback function
 * @param {Object}   options  Configuration options
 *
 * @return {Object}
 */
exports.listMetadataFields = function listMetadataFields(options = {}, callback) {
  return callApi("get", ["metadata_fields"], {}, options, callback);
};

/**
 * Deletes a metadata field definition.
 *
 * The field should no longer be considered a valid candidate for all other endpoints
 *
 * @see https://cloudinary.com/documentation/admin_api#delete_a_metadata_field_by_external_id
 *
 * @param {String}   field_external_id  The external id of the field to delete
 * @param {Function} callback           Callback function
 * @param {Object}   options            Configuration options
 *
 * @return {Object}
 */
exports.deleteMetadataField = function deleteMetadataField(field_external_id, options = {}, callback) {
  return callApi("delete", ["metadata_fields", field_external_id], {}, options, callback);
};

/**
 * Get a metadata field by external id
 *
 * @see https://cloudinary.com/documentation/admin_api#get_a_metadata_field_by_external_id
 *
 * @param {String}   external_id  The ID of the metadata field to retrieve
 * @param {Function} callback     Callback function
 * @param {Object}   options      Configuration options
 *
 * @return {Object}
 */
exports.metadataFieldByFieldId = function metadataFieldByFieldId(external_id, options = {}, callback) {
  return callApi("get", ["metadata_fields", external_id], {}, options, callback);
};

/**
 * Updates a metadata field by external id
 *
 * Updates a metadata field definition (partially, no need to pass the entire object) passed as JSON data.
 * See {@link https://cloudinary.com/documentation/admin_api#generic_structure_of_a_metadata_field Generic structure of a metadata field} for details.
 *
 * @see https://cloudinary.com/documentation/admin_api#update_a_metadata_field_by_external_id
 *
 * @param {String}   external_id  The ID of the metadata field to update
 * @param {Object}   field        Updated values of metadata field
 * @param {Function} callback     Callback function
 * @param {Object}   options      Configuration options
 *
 * @return {Object}
 */
exports.updateMetadataField = function updateMetadataField(external_id, field, options = {}, callback) {
  const params = pickOnlyExistingValues(field, "external_id", "type", "label", "mandatory", "default_value", "validation", "datasource");
  options.content_type = "json";
  return callApi("put", ["metadata_fields", external_id], params, options, callback);
};

/**
 * Updates a metadata field datasource
 *
 * Updates the datasource of a supported field type (currently only enum and set), passed as JSON data. The
 * update is partial: datasource entries with an existing external_id will be updated and entries with new
 * external_id’s (or without external_id’s) will be appended.
 *
 * @see https://cloudinary.com/documentation/admin_api#update_a_metadata_field_datasource
 *
 * @param {String}   field_external_id    The ID of the field to update
 * @param {Object}   entries_external_id  Updated values for datasource
 * @param {Function} callback             Callback function
 * @param {Object}   options              Configuration options
 *
 * @return {Object}
 */
exports.updateMetadataFieldDatasource = function updateMetadataFieldDatasource(field_external_id, entries_external_id, options = {}, callback) {
  const params = pickOnlyExistingValues(entries_external_id, "values");
  options.content_type = "json";
  return callApi("put", ["metadata_fields", field_external_id, "datasource"], params, options, callback);
};

/**
 * Deletes entries in a metadata field datasource
 *
 * Deletes (blocks) the datasource entries for a specified metadata field definition. Sets the state of the
 * entries to inactive. This is a soft delete, the entries still exist under the hood and can be activated again
 * with the restore datasource entries method.
 *
 * @see https://cloudinary.com/documentation/admin_api#delete_entries_in_a_metadata_field_datasource
 *
 * @param {String}   field_external_id    The ID of the metadata field
 * @param {Array}    entries_external_id  An array of IDs of datasource entries to delete
 * @param {Function} callback             Callback function
 * @param {Object}   options              Configuration options
 *
 * @return {Object}
 */
exports.deleteDatasourceEntries = function deleteDatasourceEntries(field_external_id, entries_external_id, options = {}, callback) {
  options.content_type = "json";
  const params = { external_ids: entries_external_id };
  return callApi("delete", ["metadata_fields", field_external_id, "datasource"], params, options, callback);
};

/**
 * Restores entries in a metadata field datasource
 *
 * Restores (unblocks) any previously deleted datasource entries for a specified metadata field definition.
 * Sets the state of the entries to active.
 *
 * @see https://cloudinary.com/documentation/admin_api#restore_entries_in_a_metadata_field_datasource
 *
 * @param {String}   field_external_id    The ID of the metadata field
 * @param {Array}    entries_external_id  An array of IDs of datasource entries to delete
 * @param {Function} callback             Callback function
 * @param {Object}   options              Configuration options
 *
 * @return {Object}
 */
exports.restoreMetadataFieldDatasource = function restoreMetadataFieldDatasource(field_external_id, entries_external_id, options = {}, callback) {
  options.content_type = "json";
  const params = { external_ids: entries_external_id };
  return callApi("post", ["metadata_fields", field_external_id, "datasource_restore"], params, options, callback);
};

/**
 * Sorts metadata field datasource. Currently supports only value
 * @param {String}   field_external_id    The ID of the metadata field
 * @param {String}   sort_by              Criteria for the sort. Currently supports only value
 * @param {String}   direction            Optional (gets either asc or desc)
 * @param {Function} callback             Callback function
 * @param {Object}   options              Configuration options
 *
 * @return {Object}
 */
exports.orderMetadataFieldDatasource = function orderMetadataFieldDatasource(field_external_id, sort_by, direction, options = {}, callback) {
  options.content_type = "json";
  const params = { order_by: sort_by, direction: direction};
  return callApi("post", ["metadata_fields", field_external_id, "datasource", "order"], params, options, callback);
};

/**
 * Reorders metadata fields.
 *
 * @param {String}   order_by  Criteria for the order (one of the fields 'label', 'external_id', 'created_at').
 * @param {String}   direction Optional (gets either asc or desc).
 * @param {Function} callback  Callback function.
 * @param {Object}   options   Configuration options.
 *
 * @return {Object}
 */
exports.reorderMetadataFields = function reorderMetadataFields(order_by, direction, options = {}, callback) {
  options.content_type = "json";
  const params = { order_by, direction };
  return callApi("put", ["metadata_fields", "order"], params, options, callback);
};
