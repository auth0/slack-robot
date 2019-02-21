'use strict';

/**
 * Handlers for all RTM `im_` events.
 */

var fromPairs = require('lodash').fromPairs;

var baseChannelHandlers = require('./base-channel');
var helpers = require('./helpers');
var models = require('../../models');

/** {@link https://api.slack.com/events/im_created|im_created} */
var handleDMCreated = function handleDMCreated(dataStore, message) {
  var dm = new models.DM(message.channel);
  dataStore.setDM(dm);
};

var changeDMOpenness = function changeDMOpenness(dataStore, message, isOpen) {
  var dm = dataStore.getDMById(message.channel);

  if (dm) {
    dm.is_open = isOpen;
    dataStore.setDM(dm);
  }
};

/** {@link https://api.slack.com/events/im_close|im_close} */
var handleDMClose = function handleDMClose(dataStore, message) {
  return changeDMOpenness(dataStore, message, false);
};

/** {@link https://api.slack.com/events/im_open|im_open} */
var handleDMOpen = function handleDMOpen(dataStore, message) {
  return changeDMOpenness(dataStore, message, true);
};

var handlers = [['im_created', handleDMCreated], ['im_marked', baseChannelHandlers.handleChannelGroupOrDMMarked], ['im_open', handleDMOpen], ['im_close', handleDMClose], ['im_history_changed', helpers.noopMessage]];

module.exports = fromPairs(handlers);