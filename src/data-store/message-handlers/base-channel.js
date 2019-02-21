/**
 * Event handlers that can be re-used between channels, groups and DMs
 */


const setBaseChannelProperty = function setBaseChannelProperty(val, key) {
  return function setBaseChannelPropertyWrapped(dataStore, message) {
    const obj = dataStore.getChannelGroupOrDMById(message.channel);
    if (obj) {
      obj[key] = val;
    }
  };
};


/**
 * {@link https://api.slack.com/events/channel_marked|channel_marked}
 * {@link https://api.slack.com/events/group_marked|group_marked}
 * {@link https://api.slack.com/events/im_marked|im_marked}
 */
const handleChannelGroupOrDMMarked = function handleChannelGroupOrDMMarked(dataStore, message) {

  const baseChannel = dataStore.getChannelGroupOrDMById(message.channel);

  if (baseChannel) {
    baseChannel.lastRead = message.ts;
    baseChannel.recalcUnreads();

    const firstChar = message.channel.substring(0, 1);

    if (firstChar === 'C') {
      dataStore.setChannel(baseChannel);
    } else if (firstChar === 'G') {
      dataStore.setGroup(baseChannel);
    } else if (firstChar === 'D') {
      dataStore.setDM(baseChannel);
    }
  }
};


/**
 * {@link https://api.slack.com/events/channel_archive|channel_archive}
 * {@link https://api.slack.com/events/group_archive|group_archive}
 */
const handleArchive = setBaseChannelProperty(true, 'is_archived');


/**
 * {@link https://api.slack.com/events/channel_unarchive|channel_unarchive}
 * {@link https://api.slack.com/events/group_unarchive|group_unarchive}
 */
const handleUnarchive = setBaseChannelProperty(false, 'is_archived');


/**
 * {@link https://api.slack.com/events/group_rename|group_rename}
 * {@link https://api.slack.com/events/channel_rename|channel_rename}
 */
const handleRename = function handleRename(dataStore, message) {
  dataStore.upsertChannelGroupOrDMById(message.channel.id, message.channel);
};


/**
 * {@link https://api.slack.com/events/group_left|group_left}
 * {@link https://api.slack.com/events/channel_left|channel_left}
 */
const handleLeave = function handleLeave(activeUserId, activeTeamId, dataStore, message) {

  const baseChannel = dataStore.getChannelGroupOrDMById(message.channel);
  if (baseChannel) {
    const index = baseChannel.members.indexOf(activeUserId);
    baseChannel.members.splice(index, 1);
  }
};

module.exports.handleChannelGroupOrDMMarked = handleChannelGroupOrDMMarked;
module.exports.handleArchive = handleArchive;
module.exports.handleUnarchive = handleUnarchive;
module.exports.handleRename = handleRename;
module.exports.handleLeave = handleLeave;
