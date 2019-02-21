const lodash = require('lodash');
const eventFixtures = require('./client-events');

const getRTMMessage = function getRTMMessage(event) {
  return lodash.cloneDeep(eventFixtures[event]);
};

module.exports.getRTMMessage = getRTMMessage;
