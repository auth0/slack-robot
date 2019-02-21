/**
 * Handlers for all RTM `bot_*` events.
 */

const fromPairs = require('lodash').fromPairs;

/** {@link https://api.slack.com/events/bot_added|bot_added} */
const addBot = function addBot(dataStore, message) {
  dataStore.setBot(message.bot);
};

/** {@link https://api.slack.com/events/bot_changed|bot_changed} */
const changedBot = function changedBot(dataStore, message) {
  dataStore.upsertBot(message.bot);
};

const handlers = [
  ['bot_added', addBot],
  ['bot_changed', changedBot]
];


module.exports = fromPairs(handlers);
