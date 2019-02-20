/**
 * Handlers for all RTM `channel_` events.
 */

var zipObject = require('lodash').zipObject;

var baseChannelHandlers = require('./base-channel');
var helpers = require('./helpers');
var models = require('../../models');


var addChannel = function addChannel(dataStore, message) {
  var newChannel = new models.Channel(message);
  dataStore.setChannel(newChannel);
};


/** {@link https://api.slack.com/events/channel_created|channel_created} */
var handleChannelCreated = function handleChannelCreated(dataStore, message) {
  addChannel(dataStore, message.channel);
};


/** {@link https://api.slack.com/events/channel_deleted|channel_deleted} */
var handleChannelDeleted = function handleChannelDeleted(dataStore, message) {
  var channelId = message.channel;
  dataStore.removeChannel(channelId);
};


/** {@link https://api.slack.com/events/channel_joined|channel_joined} */
var handleChannelJoined = function handleChannelJoined(dataStore, message) {
  dataStore.upsertChannel(message.channel);
};

/** {@link https://api.slack.com/events/channel_left|channel_left} */
var handleChannelLeft = function handleChannelLeft(activeUserId, activeTeamId, dataStore, message) {
  var channel;
  baseChannelHandlers.handleLeave(activeUserId, activeTeamId, dataStore, message);
  channel = dataStore.getChannelById(message.channel);
  if (channel) {
    channel.is_member = false;
  }
};

var handlers = [
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
