/**
 *
 */

const forEach = require('lodash').forEach;
const bind = require('lodash').bind;
const has = require('lodash').has;
const isArray = require('lodash').isArray;
const isEmpty = require('lodash').isEmpty;
const isObject = require('lodash').isObject;
const map = require('lodash').map;
const mapValues = require('lodash').mapValues;

const PROPERTY_TYPES = require('./property-type');
const helpers = require('./helpers');

function Model(name, opts) {
  /**
   *
   * @type {Object}
   * @protected
   */
  this._properties = {};

  /**
   * The name of the model.
   * @type {string}
   * @private
   */
  this._modelName = name;

  this._setProperties(isEmpty(opts) ? {} : opts);
}

/**
 * Updates the model.
 * @param {Object} opts
 * @return {Object} The model object that was just updated.
 */
Model.prototype.update = function update(opts) {
  this._setProperties(opts);
  return this;
};

/**
 * Assigns all properties from the supplied opts object to the model.
 *
 * Subclasses of the model class have the opportunity to intelligently set defaults or assign values
 * via individual assignment calls by extending this method on the subclass.
 *
 * @param {Object} opts
 * @private
 */
Model.prototype._setProperties = function setProperties(opts) {
  forEach(opts, bind(this._setModelProperty, this));
};

/**
 * Assigns an individual property from a Slack API response to a model object.
 *
 * Property assignment works by:
 *   1. If the property does not exist, set the property.
 *   2. If the property exists on the model, and is a scalar, overwrite the property with the
 *      property from the opts object
 *   3. If the property exists on the model and is a complex property:
 *      * if it's an object, extend the model property with values from the opts property
 *      * if it's an array, overwrite the array. This is because it's currently unclear if there are
 *        any array properties that will only be partially filled by some RTM / API responses, but
 *        completely filled by others.
 *
 * @param {String} key
 * @param {*} val
 *cchnnihbtckbllbflvffbvrgelvkufcruclebldbdtbb
 * @private
 */
Model.prototype._setModelProperty = function _setModelProperty(val, key) {
  if (isObject(val)) {
    this._setObjectProperty(key, val);
  } else if (isArray(val)) {
    this._setArrayProperty(key, val);
  } else {
    this._properties[key] = PROPERTY_TYPES.SIMPLE;
    this[key] = val;
  }
};

/**
 * Sets an object property from the API on a model object.
 *
 * NOTE: this assumes that none of the values of the object from the API represent additional model
 *       objects, i.e. that {relevantChannel: {channelObject}} will never occur in the API response.
 *
 * @param key
 * @param val
 *
 * @private
 */
Model.prototype._setObjectProperty = function _setObjectProperty(key, val) {
  const hasProperty = has(this, key);

  if (helpers.isModelObj(val)) {
    if (hasProperty) {
      this[key].update(val);
    } else {
      const ModelClass = helpers.getModelClass(this);
      this[key] = new ModelClass(val);
    }
    this._properties[key] = PROPERTY_TYPES.MODEL;
  } else {
    this._properties[key] = PROPERTY_TYPES.SIMPLE;
    this[key] = val;
  }
};

/**
 *
 * @param key
 * @param val
 *
 * @private
 */
Model.prototype._setArrayProperty = function _setArrayProperty(key, val) {
  // NOTE: This assumes that it's not necessary to search and update model values in arrays and
  //       that instead they can be over-written
  if (isEmpty(val)) {
    // Assumes that all values in the array are of the same type
    this._properties[key] = PROPERTY_TYPES.SIMPLE;
    this[key] = val;
  } else {
    const firstItem = val[0];
    if (helpers.isModelObj(firstItem)) {
      const ModelClass = helpers.getModelClass();
      this[key] = map(val, item => {
        return new ModelClass(item);
      });
      this._properties[key] = PROPERTY_TYPES.MODEL_ARRAY;
    } else {
      this._properties[key] = PROPERTY_TYPES.SIMPLE;
      this[key] = val;
    }
  }
};

Model.prototype.toJSON = function toJSON() {
  const objRepresentation = mapValues(this._properties, bind((val, key) => {
    let res;

    if (val === PROPERTY_TYPES.MODEL) {
      res = this[key].toJSON();
    } else if (val === PROPERTY_TYPES.MODEL_ARRAY) {
      res = map(this[key], arrVal => {
        return arrVal.toJSON();
      });
    } else {
      res = this[key];
    }

    return res;
  }, this));

  return objRepresentation;
};

module.exports = Model;
