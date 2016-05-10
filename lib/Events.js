'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var ROBOT_EVENTS = exports.ROBOT_EVENTS = {
  MESSAGE_NO_SENDER: 'message_no_sender',
  MESSAGE_NO_CHANNEL: 'message_no_channel',
  OWN_MESSAGE: 'own_message',
  IGNORED_CHANNEL: 'ignored_channel',
  NO_LISTENER_MATCH: 'no_listener_match',
  RESPONSE_FAILED: 'response_failed',
  REQUEST_HANDLED: 'request_handled',
  ERROR: 'error'
};

var RESPONSE_EVENTS = exports.RESPONSE_EVENTS = {
  TASK_ERROR: 'task_error',
  TASK_FINISHED: 'task_finished'
};