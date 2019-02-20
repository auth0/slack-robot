'use strict';

/**
 * Handlers for all RTM `star_` events.
 */

var zipObject = require('lodash').zipObject;

var helpers = require('./helpers');

var handlers = [['star_added', helpers.noopMessage], ['star_removed', helpers.noopMessage]];

module.exports = zipObject(handlers);