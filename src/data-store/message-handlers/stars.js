/**
 * Handlers for all RTM `star_` events.
 */

const zipObject = require('lodash').zipObject;

const helpers = require('./helpers');


const handlers = [
  ['star_added', helpers.noopMessage],
  ['star_removed', helpers.noopMessage]
];


module.exports = zipObject(handlers);
