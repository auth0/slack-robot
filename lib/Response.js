'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _eventemitter = require('eventemitter3');

var _eventemitter2 = _interopRequireDefault(_eventemitter);

var _client = require('@slack/client');

var _Events = require('./Events');

var _util = require('./util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var USER_PREFIX = 'user__';
var MPIM_PREFIX = 'mpim__';

var DEFAUT_POST_MESSAGE_OPTS = {
  as_user: true
};

var TASK_TYPES = {
  TEXT: 'text',
  ATTACHMENT: 'attachments',
  UPLOAD: 'file',
  REACTION: 'reaction'
};

var Response = function (_EventEmitter) {
  _inherits(Response, _EventEmitter);

  /**
   * @constructor
   * @param {WebClient} api
   * @param {SlackDataStore} dataStore
   * @param {Request} request
   * @param {number} concurrency (defaults to 1 to allow serial response sending)
   */
  function Response(slackToken, dataStore, request) {
    var concurrency = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;

    _classCallCheck(this, Response);

    var _this = _possibleConstructorReturn(this, (Response.__proto__ || Object.getPrototypeOf(Response)).call(this));

    _this._dataStore = dataStore;
    _this._defaultTarget = [request.to.id];
    _this._messageTimestamp = request.message.timestamp;

    concurrency = parseInt(concurrency, 10);

    /**
     * We use new instance of WebClient instead of passing from robot
     * to allow different concurrency option
     *
     * @type {WebClient}
     */
    _this._api = new _client.WebClient(slackToken, { maxRequestConcurrency: concurrency });

    /**
     * This is where we queue our response before actually sending them
     * by default every new item added the queue will not be processed
     * automatically (the queue will be paused) until the user explicitly
     * call .send()
     *
     * @type {AsyncQueue}
     */
    _this._queue = _async2.default.queue((0, _lodash.bind)(_this._send, _this), concurrency);
    return _this;
  }

  /**
   * Change default target, only used internally in robot.to() method.
   * Because robot.to is supposed to used by human, it's possible
   * that given array of target contain user name or channel name
   * and not an id, so we need to convert them first
   *
   * @internal
   * @param {Array.<string>} defaultTarget
   */


  _createClass(Response, [{
    key: 'setDefaultTarget',
    value: function setDefaultTarget(defaultTarget) {
      this._defaultTarget = this._mapTargetToId(defaultTarget);
    }

    /**
     * Send basic text message
     *
     * @public
     * @param {string} text
     * @param {=Array.<string>|string} optTargets
     * @return {Response}
     */

  }, {
    key: 'text',
    value: function text(_text) {
      for (var _len = arguments.length, optTargets = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        optTargets[_key - 1] = arguments[_key];
      }

      var targets = this._mapTargetToId(optTargets);
      var base = {
        type: TASK_TYPES.TEXT,
        value: _text
      };

      // do not send until told otherwise
      this._queue.pause();
      this._addToQueues(base, targets);
      return this;
    }

    /**
     * Send message with attachment
     *
     * @public
     * @param {string} text
     * @param {Array.<Object>|Object} attachment
     * @param {=Array.<string>|string} optTargets
     * @see https://api.slack.com/docs/attachments
     *
     * Also support sending attachment without text with two params
     * @param {Array.<Object>|Object} attachment
     * @param {=Array.<string>|string} optTargets
     */

  }, {
    key: 'attachment',
    value: function attachment() {
      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      var text = void 0,
          attachments = void 0,
          optTargets = void 0;

      if (typeof args[0] === 'string') {
        text = args[0];
        attachments = args[1];

        if (args.length > 2) {
          optTargets = args.splice(2);
        }
      } else {
        attachments = args[0];
        if (arguments.length > 1) {
          optTargets = args.splice(1);
        }
      }

      var targets = this._mapTargetToId(optTargets);
      var base = {
        type: TASK_TYPES.ATTACHMENT,
        value: {
          text: text,
          attachments: [attachments]
        }
      };

      if (attachments.length) {
        base.value.attachments = attachments;
      }

      // do not send until told otherwise
      this._queue.pause();
      this._addToQueues(base, targets);
      return this;
    }

    /**
     * Send a file from a string or stream
     *
     * @public
     * @param {string} filename
     * @param {string|ReadStream} content
     * @param {=Array.<string>|string} optTargets
     * @see https://nodejs.org/api/fs.html
     */

  }, {
    key: 'upload',
    value: function upload(filename, content) {
      for (var _len3 = arguments.length, optTargets = Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) {
        optTargets[_key3 - 2] = arguments[_key3];
      }

      var targets = this._mapTargetToId(optTargets);
      var base = {
        type: TASK_TYPES.UPLOAD,
        value: {
          filename: filename,
          content: content
        }
      };

      // do not send until told otherwise
      this._queue.pause();
      this._addToQueues(base, targets);
      return this;
    }

    /**
     * Add reaction to sent message
     *
     * @public
     * @param {string} emoji
     */

  }, {
    key: 'reaction',
    value: function reaction(emoji) {
      var task = {
        type: TASK_TYPES.REACTION,
        // also include target prop to prevent error when checking targetId
        target: this._defaultTarget,
        value: {
          emoji: (0, _util.stripEmoji)(emoji),
          channel: this._defaultTarget[0],
          timestamp: this._messageTimestamp
        }
      };

      this._queue.pause();
      this._addToQueue(task);
      return this;
    }

    /**
     * Wrap asynchronous task
     * @param {function} asyncTaskFn
     */

  }, {
    key: 'async',
    value: function async(asyncTaskFn) {
      var _this2 = this;

      var superPromise = new _bluebird2.default(function (resolve, reject) {
        asyncTaskFn(function (err) {
          if (err) {
            return reject(err);
          }

          return resolve();
        });
      });

      // add shortcut to send all pending queues
      superPromise.send = function () {
        return superPromise.then(function () {
          return _this2.send();
        });
      };

      return superPromise;
    }

    /**
     * Start queue processing
     *
     */

  }, {
    key: 'send',
    value: function send() {
      var _this3 = this;

      this._queue.resume();

      return new _bluebird2.default(function (resolve) {
        _this3._queue.drain = function () {
          return resolve();
        };
      });
    }

    /**
     * Add response to queue for all target
     *
     * @param {Object} base response object
     * @param {Array.<string>} targets list of channel
     */

  }, {
    key: '_addToQueues',
    value: function _addToQueues(base, targets) {
      var _this4 = this;

      targets.forEach(function (target) {
        var task = _extends({ target: target }, base);
        _this4._addToQueue(task);
      });
    }

    /**
     * Add task to queue, emit error events if task
     * failed to finish
     *
     * @private
     * @param {Object} task
     */

  }, {
    key: '_addToQueue',
    value: function _addToQueue(task) {
      var _this5 = this;

      this._queue.push(task, function (err, data) {
        if (err) {
          return _this5.emit(_Events.RESPONSE_EVENTS.TASK_ERROR, err);
        }

        _this5.emit(_Events.RESPONSE_EVENTS.TASK_FINISHED, task, data);
      });
    }

    /**
     * Send response to correct target
     *
     * @private
     * @param {Object} task
     * @param {function} callback
     */

  }, {
    key: '_send',
    value: function _send(task, callback) {
      var _this6 = this;

      if (task.target.indexOf(USER_PREFIX) > -1) {
        var userId = task.target.replace(USER_PREFIX, '');

        return this._api.dm.open(userId, function (err, data) {
          if (err) {
            return callback(err);
          }

          if (!data.ok) {
            return callback(new Error(data.error));
          }

          task.target = data.channel.id;
          _this6._sendResponse(task, callback);
        });
      } else if (task.target.indexOf(MPIM_PREFIX) > -1) {
        var userIds = task.target.replace(MPIM_PREFIX, '');

        return this._api.mpim.open(userIds, function (err, data) {
          if (err) {
            return callback(err);
          }

          if (!data.ok) {
            return callback(new Error(data.error));
          }

          task.target = data.group.id;
          _this6._sendResponse(task, callback);
        });
      }

      this._sendResponse(task, callback);
    }

    /**
     * Send response based on response type
     *
     * @private
     * @param {Object} task
     * @param {function} callback
     */

  }, {
    key: '_sendResponse',
    value: function _sendResponse(task, callback) {
      switch (task.type) {
        case TASK_TYPES.TEXT:
          this._sendTextResponse(task.target, task.value, callback);
          break;
        case TASK_TYPES.ATTACHMENT:
          this._sendAttachmentResponse(task.target, task.value, callback);
          break;
        case TASK_TYPES.UPLOAD:
          this._sendFileResponse(task.target, task.value, callback);
          break;
        case TASK_TYPES.REACTION:
          this._sendReactionResponse(task.value, callback);
          break;
        default:
          callback(null, { message: 'Unknown task type ' + task.type });
      }
    }

    /**
     * @private
     * @param {string} id channel id
     * @param {string} text
     * @param {function} callback
     */

  }, {
    key: '_sendTextResponse',
    value: function _sendTextResponse(id, text, callback) {
      var postMessageArguments = Object.assign({}, DEFAUT_POST_MESSAGE_OPTS, {
        text: text,
        channel: id
      });
      this._api.chat.postMessage(postMessageArguments, function (err, res) {
        if (err) {
          return callback(err);
        }

        callback(null, res);
      });
    }

    /**
     * @private
     * @param {string} id channel id
     * @param {object} attachment
     * @param {function} callback
     */

  }, {
    key: '_sendAttachmentResponse',
    value: function _sendAttachmentResponse(id, attachment, callback) {
      var text = attachment.text,
          attachments = attachment.attachments;

      var opts = _extends({}, DEFAUT_POST_MESSAGE_OPTS, {
        attachments: JSON.stringify(attachments)
      });

      this._api.chat.postMessage(id, text, opts, function (err, res) {
        if (err) {
          return callback(err);
        }

        callback(null, res);
      });
    }

    /**
     * @private
     * @param {object} reaction
     * @param {function} callback
     */

  }, {
    key: '_sendReactionResponse',
    value: function _sendReactionResponse(reaction, callback) {
      var opts = {
        channel: reaction.channel,
        timestamp: reaction.timestamp
      };

      this._api.reactions.add(reaction.emoji, opts, function (err, res) {
        if (err) {
          return callback(err);
        }

        callback(null, res);
      });
    }

    /**
     * Instead of using WebClient, use "request" with multipart support
     * for uploading binary
     * TODO use WebClient when this is fixed
     *
     * @private
     * @param {string} id channel id
     * @param {object} file
     * @param {function} callback
     */

  }, {
    key: '_sendFileResponse',
    value: function _sendFileResponse(id, file, callback) {
      var url = 'https://slack.com/api/files.upload';

      var r = _request2.default.post(url, function (err, res, body) {
        if (err) {
          return callback(err);
        }

        var data = JSON.parse(body);

        if (!data.ok) {
          return callback(new Error(data.error));
        }

        callback(null, data);
      });

      var form = r.form();

      form.append('token', this._api._accessToken);
      form.append('channels', id);
      form.append('filename', file.filename);
      form.append('filetype', (0, _util.getFileExtension)(file.filename));

      /**
       * Slack API expect one of two fields, file or content.
       * file is used when sending multipart/form-data, content
       * is used when sending urlencodedform
       * @see https://api.slack.com/methods/files.upload
       */
      if (file.content instanceof _fs2.default.ReadStream) {
        form.append('file', file.content);
      } else {
        form.append('content', file.content);
      }
    }

    /**
     * Convert given array of target into array of id.
     * If no target is specified, use defaultTarget
     *
     * @private
     * @param {=Array.<string>} targets
     * @return {Array.<string>}
     */

  }, {
    key: '_mapTargetToId',
    value: function _mapTargetToId(optTargets) {
      var _this7 = this;

      var targets = optTargets && optTargets.length > 0 ? optTargets : this._defaultTarget;
      var idFormat = ['C', 'G', 'D'];

      return targets.map(function (target) {
        if (Array.isArray(target)) {
          return _this7._getMpimTarget(target);
        }

        // skip mapping if already an id
        if (idFormat.indexOf(target.substring(0, 1)) > -1) {
          return target;
        }

        var channel = _this7._dataStore.getChannelOrGroupByName(target);

        if (!channel) {
          // not a channel or group, use user id
          // prefix with u__ to mark that we need to "open im" first
          // before we can send message
          var user = _this7._dataStore.getUserByName(target.replace('@', ''));

          if (!user) {
            return null;
          }

          return USER_PREFIX + user.id;
        }

        return channel.id;
      }).filter(function (target) {
        return target !== null;
      });
    }

    /**
     * MPIM target is marked by specifying array of target,
     * we need to get list of user id (if not already),
     * and exclude invalid target (channel, group, etc)
     *
     * @param {Array.<string>} users
     * @return {string}
     */

  }, {
    key: '_getMpimTarget',
    value: function _getMpimTarget(users) {
      var _this8 = this;

      var userIds = users.map(function (t) {
        var mark = t.substring(0, 1);
        switch (mark) {
          // direct message, we need to get the user id
          case 'D':
            {
              var dm = _this8._dataStore.getDMById(t);

              if (!dm) {
                return null;
              }

              return dm.user;
            }

          case 'U':
            return t;

          // invalid input
          case 'C':
          case 'G':
            return null;

          // treat other target as user name
          default:
            {
              var user = _this8._dataStore.getUserByName(t.replace('@', ''));

              if (!user) {
                return null;
              }

              return user.id;
            }
        }
      }).filter(function (user) {
        return user !== null;
      });

      return MPIM_PREFIX + userIds.join(',');
    }
  }]);

  return Response;
}(_eventemitter2.default);

exports.default = Response;