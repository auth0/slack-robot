/**
 * Handlers for all RTM `im_` events.
 */

const zipObject = require('lodash').zipObject;

const baseChannelHandlers = require('./base-channel');
const helpers = require('./helpers');
const models = require('../../models');


/** {@link https://api.slack.com/events/im_created|im_created} */
const handleDMCreated = function handleDMCreated(dataStore, message) {
  const dm = new models.DM(message.channel);
  dataStore.setDM(dm);
};


const changeDMOpenness = function changeDMOpenness(dataStore, message, isOpen) {
  const dm = dataStore.getDMById(message.channel);

  if (dm) {
    dm.is_open = isOpen;
    dataStore.setDM(dm);
  }
};


/** {@link https://api.slack.com/events/im_close|im_close} */
const handleDMClose = function handleDMClose(dataStore, message) {
  return changeDMOpenness(dataStore, message, false);
};


/** {@link https://api.slack.com/events/im_open|im_open} */
const handleDMOpen = function handleDMOpen(dataStore, message) {
  return changeDMOpenness(dataStore, message, true);
};


const handlers = [
  ['im_created', handleDMCreated],
  ['im_marked', baseChannelHandlers.handleChannelGroupOrDMMarked],
  ['im_open', handleDMOpen],
  ['im_close', handleDMClose],
  ['im_history_changed', helpers.noopMessage]
];


module.exports = zipObject(handlers);
