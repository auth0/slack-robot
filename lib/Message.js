'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _util = require('./util');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @public
 * @param {Object} bot
 * @param {SlackDataStore} dataStore
 * @param {Object} messageObject
 * @return {Object}
 */

var Message = function Message(bot, dataStore, messageObject) {
  _classCallCheck(this, Message);

  var type = messageObject.type;
  var from = dataStore.getUserById(messageObject.user) || messageObject.user || messageObject.username;

  var to = void 0;
  var channelId = void 0;
  var value = {};
  var timestamp = void 0;
  var attachments = void 0;

  switch (type) {
    case 'message':
      channelId = messageObject.channel;
      value = parseTextMessage(dataStore, bot, messageObject.text);
      timestamp = messageObject.ts;
      break;
    case 'reaction_added':
      channelId = messageObject.item.channel;
      timestamp = messageObject.item.ts;
      value = { emoji: (0, _util.stripEmoji)(messageObject.reaction) };
      break;
    default:
  }

  if (channelId) {
    to = dataStore.getChannelGroupOrDMById(channelId);
  }

  this.from = from;
  this.to = to;
  this.timestamp = timestamp;
  this.type = type;
  this.subtype = messageObject.files && messageObject.files.length > 0 && 'file_share';
  this.value = value;
  this.file = messageObject.files && messageObject.files[0];
  this.attachments = messageObject.attachments;
};
/**
 * Parse message text and convert user/channel reference and links
 *
 * @private
 * @param {SlackDataStore} dataStore
 * @param {Object} bot
 * @param {?string} textMessage
 * @see https://github.com/slackhq/hubot-slack/blob/master/src/slack.coffee#L153
 * @return {object}
 */


exports.default = Message;
function parseTextMessage(dataStore, bot, textMessage) {
  var mentioned = false;
  var explicitMention = false;

  if (!textMessage) {
    textMessage = '';
  }

  var text = textMessage.replace(/<([@#!])?([^>|]+)(?:\|([^>]+))?>/g, function (m, type, link, label) {
    switch (type) {
      case '@':
        {
          if (label) {
            return '@' + label;
          }

          var user = dataStore.getUserById(link);
          if (user) {
            return '@' + user.name;
          }
        }
      case '#':
        {
          if (label) {
            return '#' + label;
          }

          var channel = dataStore.getChannelById(link);
          if (channel) {
            return '#' + channel.name;
          }
        }
      case '!':
        if (['channel', 'group', 'everyone'].indexOf(link) !== -1) {
          return '@' + link;
        }

      default:
        link = link.replace('/^mailto:/', '');
        if (label && link.indexOf(label) === -1) {
          return label + '(' + link + ')';
        }
        return link;
    }
  });
  text = text.split(' ').filter(function (x) {
    return x !== '';
  }).join(' ');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&amp;/g, '&');

  var botMatcher = new RegExp('@?' + bot.name + ':?');
  var explicitBotMatcher = new RegExp('@' + bot.name + ':?');
  explicitMention = !!text.match(explicitBotMatcher);

  if (text.match(botMatcher)) {
    mentioned = true;
    text = text.split(botMatcher).map(function (x) {
      return x.trim();
    }).join(' ').trim();
  }

  return {
    text: text,
    mentioned: mentioned,
    explicitMention: explicitMention
  };
}