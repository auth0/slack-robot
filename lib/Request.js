'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Request = function Request(msg, listener) {
  _classCallCheck(this, Request);

  var message = {
    type: msg.type,
    value: msg.value,
    timestamp: msg.timestamp
  };
  var from = msg.from;
  var to = msg.to;
  var params = {};
  var matches = [];

  if (msg.to) {
    switch (to.id.charAt(0).toLowerCase()) {
      case 'c':
        to.type = 'channel';
        break;
      case 'g':
        to.type = 'group';
        break;
      case 'd':
        to.type = 'dm';
        break;
      /* istanbul ignore next: */
      default:
        to.type = 'channel';
    }
  }

  if (message.type === 'message') {
    params = getParams(message.value.text, listener.value, listener.matcher);

    // do not fill matches when params exist
    if (Object.keys(params).length === 0) {
      matches = getMatches(message.value.text, listener.matcher);
    }
  }

  this.message = message;
  this.from = from;
  this.to = to;
  this.params = params;
  this.matches = matches;
  this.listener = listener;

  Object.defineProperty(this, 'user', {
    enumerable: false,
    writable: false,
    value: this.from
  });

  Object.defineProperty(this, 'channel', {
    enumerable: false,
    writable: false,
    value: this.to
  });
};

/**
 * @private
 * @param {string} text
 * @param {string|RegExp} value
 * @param {RegExp} matcher
 * @return {Object}
 */


exports.default = Request;
function getParams(text, value, matcher) {
  var payload = {};

  if (value instanceof RegExp) {
    return payload;
  }

  var payloadList = value.match(/:[a-zA-Z]+/g);

  if (!payloadList) {
    return payload;
  }

  // remove leading ":" in named regex
  payloadList = payloadList.map(function (v) {
    return v.replace(/^:/, '');
  });

  for (var i = 0; i < payloadList.length; i++) {
    var regexIndex = '$' + (i + 1);
    var payloadName = payloadList[i];
    payload[payloadName] = text.replace(matcher, regexIndex);
  }

  return payload;
}

/**
 * @private
 * @param {string} text
 * @param {RegExp} matcher
 */
function getMatches(text, matcher) {
  var matches = text.match(matcher);

  // first regex match always return the message and we don't need it
  // we only care about other matches so we remove it from result
  matches.shift();

  return Array.prototype.slice.call(matches);
}