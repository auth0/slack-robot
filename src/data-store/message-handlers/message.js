/**
 * Handlers for all `message` event subtypes.
 */

const findIndex = require('lodash').findIndex;
const fromPairs = require('lodash').fromPairs;

const makeMessageEventWithSubtype = function makeMessageEventWithSubtype(subtype, delim) {
  return ['message', subtype].join(delim || '::');
};

const addMessageToChannel = function addMessageToChannel(dataStore, message) {
  const baseChannel = dataStore.getChannelGroupOrDMById(message.channel);
  baseChannel.addMessage(message);
};


/**
 * {@link https://api.slack.com/events/message/channel_join|channel_join}
 * {@link https://api.slack.com/events/message/group_join|group_join}
 */
const baseChannelJoin = function baseChannelJoin(dataStore, message) {
  const baseChannel = dataStore.getChannelGroupOrDMById(message.channel);

  if (baseChannel.members.indexOf(message.user) === -1) {
    baseChannel.members.push(message.user);
  }

  baseChannel.addMessage(message);
};


/**
 * {@link https://api.slack.com/events/message/channel_join|channel_join}
 * {@link https://api.slack.com/events/message/group_join|group_join}
 */
const baseChannelLeave = function baseChannelLeave(dataStore, message) {
  const baseChannel = dataStore.getChannelGroupOrDMById(message.channel);

  const memberIndex = baseChannel.members.indexOf(message.user);
  if (memberIndex !== -1) {
    baseChannel.members.splice(memberIndex, 1);
  }

  baseChannel.addMessage(message);
};


/** {@link https://api.slack.com/events/message/message_deleted|message_deleted} */
const baseChannelMessageDeleted = function baseChannelMessageDeleted(dataStore, message) {
  const baseChannel = dataStore.getChannelGroupOrDMById(message.channel);
  const msgIndex = findIndex(baseChannel.history, 'ts', message.deleted_ts);
  baseChannel.history.splice(msgIndex, 1);
  baseChannel.addMessage(message);
};


/** {@link https://api.slack.com/events/message/message_changed|message_changed} */
const baseChannelMessageChanged = function baseChannelMessageChanged(dataStore, message) {
  const baseChannel = dataStore.getChannelGroupOrDMById(message.channel);
  baseChannel.updateMessage(message);
  baseChannel.addMessage(message);
};


const handlers = [
  [makeMessageEventWithSubtype('message_deleted'), baseChannelMessageDeleted],
  [makeMessageEventWithSubtype('message_changed'), baseChannelMessageChanged],
  [makeMessageEventWithSubtype('channel_join'), baseChannelJoin],
  [makeMessageEventWithSubtype('channel_leave'), baseChannelLeave],
  [makeMessageEventWithSubtype('group_join'), baseChannelJoin],
  [makeMessageEventWithSubtype('group_leave'), baseChannelLeave],
  // Add in a default handler for all other message subtypes
  [makeMessageEventWithSubtype('rtm_client_add_message'), addMessageToChannel]
];


module.exports = fromPairs(handlers);
