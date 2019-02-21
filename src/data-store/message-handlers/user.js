/**
 * Handlers for all RTM `user_*` events.
 */

const zipObject = require('lodash').zipObject;

const helpers = require('./helpers');

/** {@link https://api.slack.com/events/user_typing|user_typing} */
const handleUserTyping = function handleUserTyping(dataStore, message) {
  const user = dataStore.getUserById(message.user);
  const channel = dataStore.getChannelById(message.channel);

  if (channel && user) {
    channel.startedTyping(user.id);
  } else {
    // TODO(leah): Logs for when channel / user aren't found.
  }
};

/** {@link https://api.slack.com/events/pref_change|pref_change} */
const handlePrefChange = function handlePrefChange(activeUserId, activeTeamId, dataStore, message) {
  const user = dataStore.getUserById(activeUserId);
  user.prefs[message.name] = message.value;
};

const handlers = [
  ['pref_change', handlePrefChange],
  ['user_typing', handleUserTyping],
  ['user_change', helpers.handleNewOrUpdatedUser]
];

module.exports = zipObject(handlers);
