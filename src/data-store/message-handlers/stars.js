/**
 * Handlers for all RTM `star_` events.
 */

const fromPairs = require('lodash').fromPairs;

const helpers = require('./helpers');

const handlers = [
  ['star_added', helpers.noopMessage],
  ['star_removed', helpers.noopMessage]
];

module.exports = fromPairs(handlers);
