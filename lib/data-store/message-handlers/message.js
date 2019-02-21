'use strict';

/**
 * Handlers for all `message` event subtypes.
 */

var findIndex = require('lodash').findIndex;
var fromPairs = require('lodash').fromPairs;

var makeMessageEventWithSubtype = function makeMessageEventWithSubtype(subtype, delim) {
  return ['message', subtype].join(delim || '::');
};

var addMessageToChannel = function addMessageToChannel(dataStore, message) {
  var baseChannel = dataStore.getChannelGroupOrDMById(message.channel);
  baseChannel.addMessage(message);
};

/**
 * {@link https://api.slack.com/events/message/channel_join|channel_join}
 * {@link https://api.slack.com/events/message/group_join|group_join}
 */
var baseChannelJoin = function baseChannelJoin(dataStore, message) {
  var baseChannel = dataStore.getChannelGroupOrDMById(message.channel);

  if (baseChannel.members.indexOf(message.user) === -1) {
    baseChannel.members.push(message.user);
  }

  baseChannel.addMessage(message);
};

/**
 * {@link https://api.slack.com/events/message/channel_join|channel_join}
 * {@link https://api.slack.com/events/message/group_join|group_join}
 */
var baseChannelLeave = function baseChannelLeave(dataStore, message) {
  var baseChannel = dataStore.getChannelGroupOrDMById(message.channel);

  var memberIndex = baseChannel.members.indexOf(message.user);
  if (memberIndex !== -1) {
    baseChannel.members.splice(memberIndex, 1);
  }

  baseChannel.addMessage(message);
};

/** {@link https://api.slack.com/events/message/message_deleted|message_deleted} */
var baseChannelMessageDeleted = function baseChannelMessageDeleted(dataStore, message) {
  var baseChannel = dataStore.getChannelGroupOrDMById(message.channel);
  var msgIndex = findIndex(baseChannel.history, 'ts', message.deleted_ts);
  baseChannel.history.splice(msgIndex, 1);
  baseChannel.addMessage(message);
};

/** {@link https://api.slack.com/events/message/message_changed|message_changed} */
var baseChannelMessageChanged = function baseChannelMessageChanged(dataStore, message) {
  var baseChannel = dataStore.getChannelGroupOrDMById(message.channel);
  baseChannel.updateMessage(message);
  baseChannel.addMessage(message);
};

var handlers = [[makeMessageEventWithSubtype('message_deleted'), baseChannelMessageDeleted], [makeMessageEventWithSubtype('message_changed'), baseChannelMessageChanged], [makeMessageEventWithSubtype('channel_join'), baseChannelJoin], [makeMessageEventWithSubtype('channel_leave'), baseChannelLeave], [makeMessageEventWithSubtype('group_join'), baseChannelJoin], [makeMessageEventWithSubtype('group_leave'), baseChannelLeave],
// Add in a default handler for all other message subtypes
[makeMessageEventWithSubtype('rtm_client_add_message'), addMessageToChannel]];

module.exports = fromPairs(handlers);