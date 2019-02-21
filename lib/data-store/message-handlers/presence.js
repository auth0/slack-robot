'use strict';

/**
 * Event handlers for RTM presence change events.
 */

var fromPairs = require('lodash').fromPairs;

/** {@link https://api.slack.com/events/manual_presence_change|manual_presence_change} */
var handleManualPresenceChange = function handleManualPresenceChange(activeUserId, activeTeamId, dataStore, message) {
  var user = dataStore.getUserById(activeUserId);
  user.presence = message.presence;
};

/** {@link https://api.slack.com/events/presence_change|presence_change} */
var handlePresenceChange = function handlePresenceChange(dataStore, message) {
  var user = dataStore.getUserById(message.user);
  user.presence = message.presence;
};

var handlers = [['manual_presence_change', handleManualPresenceChange], ['presence_change', handlePresenceChange]];

module.exports = fromPairs(handlers);