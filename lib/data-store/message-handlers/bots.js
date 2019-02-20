'use strict';

/**
 * Handlers for all RTM `bot_*` events.
 */

var zipObject = require('lodash').zipObject;

/** {@link https://api.slack.com/events/bot_added|bot_added} */
var addBot = function addBot(dataStore, message) {
  dataStore.setBot(message.bot);
};

/** {@link https://api.slack.com/events/bot_changed|bot_changed} */
var changedBot = function changedBot(dataStore, message) {
  dataStore.upsertBot(message.bot);
};

var handlers = [['bot_added', addBot], ['bot_changed', changedBot]];

module.exports = zipObject(handlers);