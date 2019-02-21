/**
 *
 */

const models = require('../../models');


const noopMessage = function noopMessage(dataStore, message) {
  return message;
};


/**
 * {@link https://api.slack.com/events/team_join|team_join}
 * {@link https://api.slack.com/events/user_change|user_change}
 */
const handleNewOrUpdatedUser = function handleNewOrUpdatedUser(dataStore, message) {
  let user = dataStore.getUserById(message.user.id);
  if (user) {
    user.update(message.user);
  } else {
    user = new models.User(message.user);
  }
  dataStore.setUser(user);
};


module.exports.handleNewOrUpdatedUser = handleNewOrUpdatedUser;
module.exports.noopMessage = noopMessage;
