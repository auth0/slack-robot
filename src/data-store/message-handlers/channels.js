/**
 * Handlers for all RTM `channel_` events.
 */

const zipObject = require('lodash').zipObject;

const baseChannelHandlers = require('./base-channel');
const helpers = require('./helpers');
const models = require('../../models');


const addChannel = function addChannel(dataStore, message) {
  const newChannel = new models.Channel(message);
  dataStore.setChannel(newChannel);
};


/** {@link https://api.slack.com/events/channel_created|channel_created} */
const handleChannelCreated = function handleChannelCreated(dataStore, message) {
  addChannel(dataStore, message.channel);
};


/** {@link https://api.slack.com/events/channel_deleted|channel_deleted} */
const handleChannelDeleted = function handleChannelDeleted(dataStore, message) {
  const channelId = message.channel;
  dataStore.removeChannel(channelId);
};


/** {@link https://api.slack.com/events/channel_joined|channel_joined} */
const handleChannelJoined = function handleChannelJoined(dataStore, message) {
  dataStore.upsertChannel(message.channel);
};

/** {@link https://api.slack.com/events/channel_left|channel_left} */
const handleChannelLeft = function handleChannelLeft(activeUserId, activeTeamId, dataStore, message) {
  baseChannelHandlers.handleLeave(activeUserId, activeTeamId, dataStore, message);
  const channel = dataStore.getChannelById(message.channel);
  if (channel) {
    channel.is_member = false;
  }
};

const handlers = [
  ['channel_archive', baseChannelHandlers.handleArchive],
  ['channel_created', handleChannelCreated],
  ['channel_deleted', handleChannelDeleted],
  ['channel_history_changed', helpers.noopMessage],
  ['channel_joined', handleChannelJoined],
  ['channel_left', handleChannelLeft],
  ['channel_marked', baseChannelHandlers.handleChannelGroupOrDMMarked],
  ['channel_rename', baseChannelHandlers.handleRename],
  ['channel_unarchive', baseChannelHandlers.handleUnarchive]
];


module.exports = zipObject(handlers);
