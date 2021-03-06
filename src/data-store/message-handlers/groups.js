/**
 * Handlers for all RTM `group_` events.
 */

const fromPairs = require('lodash').fromPairs;

const baseChannelHandlers = require('./base-channel');
const helpers = require('./helpers');
const models = require('../../models');


/** {@link https://api.slack.com/events/group_joined|group_joined} */
const handleGroupJoined = function handleGroupJoined(dataStore, message) {
  const group = new models.Group(message.channel);
  dataStore.setGroup(group);
};


/**
 * {@link https://api.slack.com/events/group_left|group_left}
 */
const handleGroupLeave = function handleGroupLeave(activeUserId, activeTeamId, dataStore, message) {
  baseChannelHandlers.handleLeave(activeUserId, activeTeamId, dataStore, message);

  const group = dataStore.getGroupById(message.channel);
  if (group) {
    // TODO(leah): Maybe this should remove the group?
    if (group.members.length === 0) {
      group.is_archived = true;
    }
    dataStore.setGroup(group);
  }
};


const handlers = [
  ['group_archive', baseChannelHandlers.handleArchive],
  ['group_close', helpers.noopMessage],
  ['group_joined', handleGroupJoined],
  ['group_left', handleGroupLeave],
  ['group_marked', baseChannelHandlers.handleChannelGroupOrDMMarked],
  ['group_open', helpers.noopMessage],
  ['group_unarchive', baseChannelHandlers.handleUnarchive],
  ['group_rename', baseChannelHandlers.handleRename],
  ['group_history_changed', helpers.noopMessage]
];


module.exports = fromPairs(handlers);
