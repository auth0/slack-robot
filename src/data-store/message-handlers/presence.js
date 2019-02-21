/**
 * Event handlers for RTM presence change events.
 */

const fromPairs = require('lodash').fromPairs;


/** {@link https://api.slack.com/events/manual_presence_change|manual_presence_change} */
const handleManualPresenceChange = function handleManualPresenceChange(
  activeUserId, activeTeamId, dataStore, message) {
  const user = dataStore.getUserById(activeUserId);
  user.presence = message.presence;
};


/** {@link https://api.slack.com/events/presence_change|presence_change} */
const handlePresenceChange = function handlePresenceChange(dataStore, message) {
  const user = dataStore.getUserById(message.user);
  user.presence = message.presence;
};


const handlers = [
  ['manual_presence_change', handleManualPresenceChange],
  ['presence_change', handlePresenceChange]
];


module.exports = fromPairs(handlers);
