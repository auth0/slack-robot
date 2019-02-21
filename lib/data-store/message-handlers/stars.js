'use strict';

/**
 * Handlers for all RTM `star_` events.
 */

var fromPairs = require('lodash').fromPairs;

var helpers = require('./helpers');

var handlers = [['star_added', helpers.noopMessage], ['star_removed', helpers.noopMessage]];

module.exports = fromPairs(handlers);