/**
 * Handlers for all RTM `reaction_xxx` events.
 */

const findIndex = require('lodash').findIndex;
const partial = require('lodash').partial;
const fromPairs = require('lodash').fromPairs;

/**
 *
 * @param {Object} dataStore
 * @param {Object} message
 * @param {boolean} isAdded
 */
const toggleReactionForMessage = function toggleReactionForMessage(dataStore, message, isAdded) {
  const item = message.item;

  const channel = dataStore.getChannelGroupOrDMById(item.channel);
  const msgObj = channel.getMessageByTs(item.ts);

  // Ensure a reactions array is available on the message object
  msgObj.reactions = msgObj.reactions || [];

  // If there's a message in the local cache, update it, otherwise do nothing as the message
  // with reaction will get populated when it's next needed from history.
  if (message) {
    const reactionIndex = findIndex(msgObj.reactions, { name: message.reaction });
    const reaction = msgObj.reactions[reactionIndex];

    if (reaction) {
      reaction.count = Math.max(reaction.count + (isAdded ? 1 : -1), 0);

      if (isAdded) {
        // NOTE: This will not necessarily be consistent with the users array if the
        //       message is pulled from the server. This is because the server only stores
        //       X users per reaction, whereas the client will store as many as it's
        //       notified about.
        reaction.users.push(message.user);
      } else {
        if (reaction.count === 0) {
          msgObj.reactions.splice(reactionIndex, 1);
        } else {
          const userIndex = reaction.users.indexOf(message.user);
          if (userIndex > -1) {
            reaction.users.splice(userIndex, 1);
          }
        }
      }
    } else {
      msgObj.reactions.push({
        name: message.reaction,
        users: [message.user],
        count: 1
      });
    }
  }
};


const toggleReactionForFile = function toggleReactionForFile() {
  // TODO(leah): Update this once files are supported in the data-store implementation
};


const toggleReactionForFileComment = function toggleReactionForFileComment() {
  // TODO(leah): Update this once files are supported in the data-store implementation
};


const toggleReaction = function toggleReaction(isAdded, dataStore, message) {
  const itemType = message.item.type;

  if (itemType === 'file') {
    toggleReactionForFile(dataStore, message, isAdded);
  } else if (itemType === 'file_comment') {
    toggleReactionForFileComment(dataStore, message, isAdded);
  } else if (itemType === 'message') {
    toggleReactionForMessage(dataStore, message, isAdded);
  }
};

const handlers = [
  ['reaction_added', partial(toggleReaction, true)],
  ['reaction_removed', partial(toggleReaction, false)]
];

module.exports = fromPairs(handlers);
