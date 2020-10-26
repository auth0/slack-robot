'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _log = require('log');

var _log2 = _interopRequireDefault(_log);

var _eventemitter = require('eventemitter3');

var _eventemitter2 = _interopRequireDefault(_eventemitter);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _webApi = require('@slack/web-api');

var _rtmApi = require('@slack/rtm-api');

var _Listeners = require('./Listeners');

var _Listeners2 = _interopRequireDefault(_Listeners);

var _Message = require('./Message');

var _Message2 = _interopRequireDefault(_Message);

var _Request = require('./Request');

var _Request2 = _interopRequireDefault(_Request);

var _Response = require('./Response');

var _Response2 = _interopRequireDefault(_Response);

var _plugins = require('./plugins');

var _plugins2 = _interopRequireDefault(_plugins);

var _acls = require('./acls');

var _acls2 = _interopRequireDefault(_acls);

var _dataStore = require('./data-store');

var _Events = require('./Events');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var logger = new _log2.default('info');

var DEFAULT_OPTIONS = {
  dynamicMention: false
};

var Robot = function (_EventEmitter) {
  _inherits(Robot, _EventEmitter);

  function Robot(token) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? DEFAULT_OPTIONS : arguments[1];

    _classCallCheck(this, Robot);

    if (!token) {
      throw new Error('Invalid slack access token');
    }

    /**
     * Bot information
     *
     * @public
     */
    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Robot).call(this));

    _this.bot = null;

    /**
     * All built-in acl
     *
     * @public
     */
    _this.acls = _acls2.default;

    /**
     *
     * @private
     */
    _this._options = options;

    /**
     *
     * @private
     */
    _this._token = token;

    /**
     * Bot properties
     *
     * @var {Object}
     * @private
     */
    _this._vars = {
      concurrency: 1,
      help_generator: false
    };

    /**
     * List of message that is not processed yet by listener, mainly because
     * missing information. Currently only stored reaction_added event message
     *
     * @var {Array.<MessageQueue>}
     * @private
     */
    _this._messageQueue = [];

    /**
     *
     * @var {Array.<function(robot)>}
     * @private
     */
    _this._plugins = [];

    /**
     * Ignore all listener in this channel
     *
     * @private
     */
    _this._ignoredChannels = [];

    /**
     * Use slack-client it to simplify user & channel mapping
     * instead of creating our own, websocket listener is also
     * already handled
     *
     * @param {string} token
     * @private
     */
    _this._rtm = new _rtmApi.RTMClient(token, { useRtmConnect: false });

    /**
     * API call via slack-client WebClient
     *
     * @param {string} token
     * @private
     */
    _this._api = new _webApi.WebClient(token, { maxRequestConcurrency: 5 });

    /**
     *
     * @private
     */
    _this._listeners = new _Listeners2.default();

    _this._dataStore = new _dataStore.MemoryDataStore();
    return _this;
  }

  /**
   * Shortcut for listening text message
   *
   * @public
   * @param {?string|RegExp} message
   * @param {?function} callback
   * @returns {Listener}
   */


  _createClass(Robot, [{
    key: 'listen',
    value: function listen(message, callback) {
      return this.when('message', message, callback);
    }

    /**
     * Generic listener
     *
     * @param {string} type
     * @param {string|RegExp} value
     * @param {function} callback
     */

  }, {
    key: 'when',
    value: function when(type, value, callback) {
      if (!type || typeof type !== 'string') {
        throw new TypeError('Invalid listener type');
      }

      if (!value || typeof value !== 'string' && value instanceof RegExp === false) {
        throw new TypeError('Invalid message to listen');
      }

      if (!callback || typeof callback !== 'function') {
        throw new TypeError('Callback must be a function');
      }

      var listener = this._listeners.add(type, value, callback);
      if (this._options.dynamicMention) {
        listener.acl(this.acls.dynamicMention);
      }

      return listener;
    }

    /**
     * Add channel(s) to ignored list, so it won't be processed
     * no matter what the listener is
     *
     * @public
     * @param {...string} channels
     */

  }, {
    key: 'ignore',
    value: function ignore() {
      var _this2 = this;

      for (var _len = arguments.length, channels = Array(_len), _key = 0; _key < _len; _key++) {
        channels[_key] = arguments[_key];
      }

      channels.forEach(function (channel) {
        if (_this2._ignoredChannels.indexOf(channel) === -1) {
          _this2._ignoredChannels.push(channel);
        }
      });
    }

    /**
     * Inject plugin
     *
     * @public
     * @param {function} plugin
     */

  }, {
    key: 'use',
    value: function use(plugin) {
      if (typeof plugin !== 'function') {
        throw new Error('Invalid plugin type');
      }

      if (this._plugins.indexOf(plugin) === -1) {
        plugin(this);
        this._plugins.push(plugin);
      }
    }

    /**
     * Change bot property
     *
     * @public
     * @param {string} property
     * @param {any} value
     */

  }, {
    key: 'set',
    value: function set(property, value) {
      if (value !== null && value !== undefined) {
        // special property
        if (property === 'help_generator') {
          this.use(_plugins2.default.helpGenerator({ enable: Boolean(value) }));
        }

        this._vars[property] = value;
      }
    }

    /**
     * Get bot property
     *
     * @public
     * @return {any}
     */

  }, {
    key: 'get',
    value: function get(property) {
      return this._vars[property];
    }

    /**
     * Send robot response by without listener
     * Caveat: .reaction. .async is disabled
     *
     * @public
     * @param {...string} target
     * @param {Function} callback
     */

  }, {
    key: 'to',
    value: function to() {
      var _this3 = this;

      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      // Hack to allow var args to be specified as first argument
      // instead of last
      var callback = args.splice(args.length - 1)[0];
      var target = args;

      if (this.bot === null) {
        // not connected
        return setTimeout(function () {
          _this3.to.apply(_this3, target.concat([callback]));
        }, 100);
      }

      // At first we create a faux request to make sure we can create
      // response object properly, after that we change default target
      // in response object so user can just run res.text without having
      // to think about target id anymore
      var req = { to: { id: target[0] }, message: {} };
      var res = new _Response2.default(this._token, this._dataStore, req, this._vars.concurrency);
      res.setDefaultTarget(target);

      ['reaction', 'async'].forEach(function (invalidMethod) {
        Object.defineProperty(res, invalidMethod, {
          get: function get() {
            return function invalid() {
              throw new Error('Cannot use method .' + invalidMethod + '() in robot.to()');
            };
          }
        });
      });

      callback(res);
    }

    /**
     * Get list of listeners
     *
     * @public
     * @return {Array.<Listener>}
     */

  }, {
    key: 'getAllListeners',
    value: function getAllListeners() {
      return this._listeners.get();
    }

    /**
     * Get listener by id
     *
     * @public
     * @param {string} listenerId
     * @return {?Listener}
     */

  }, {
    key: 'getListener',
    value: function getListener(listenerId) {
      return this._listeners.get(listenerId);
    }

    /**
     * Remove listener by id
     *
     * @public
     * @param {string} listenerId
     */

  }, {
    key: 'removeListener',
    value: function removeListener(listenerId) {
      return this._listeners.remove(listenerId);
    }

    /**
     * Login and start actually listening to message
     *
     * @public
     */

  }, {
    key: 'start',
    value: function start() {
      var _this4 = this;

      this._rtm.on('authenticated', function (data) {
        if (data) {
          _this4._dataStore.cacheRtmStart(data);
        }
        _this4.bot = _this4._dataStore.getUserById(_this4._rtm.activeUserId);
        var dataStore = _this4._dataStore;
        var rtmClient = _this4._rtm;
        _this4._rtm.on('slack_event', function (type, message) {
          try {
            dataStore.handleRtmMessage(rtmClient.activeUserId, rtmClient.activeTeamId, type, message);
          } catch (err) {
            logger.error('Cannot handle RTM message. type: ' + type + ', message: ' + JSON.stringify(message));
          }
        });
        logger.info('Logged in as ' + _this4.bot.name);
      });

      this._rtm.on('message', function (message) {
        if (message.subtype === 'message_changed') {
          /**
           * This is a follow up from reaction_added event added to file object
           * contain current message object and previous message object.
           * Currently it's the only possible scenario, because the bot
           * cannot edit message yet
           */
          return _this4._processQueuedMessage(message);
        }

        _this4._onMessage(message);
      });

      this._rtm.on('reaction_added', function (message) {
        /**
         * reaction_added event on file does not send info about
         * current channel, so we can't use it to respond correctly.
         * Instead of automatically triggering response for reaction_added
         * event, queue them until "message_changed" event arrived. Note
         * that this is not applicable for text/attachment
         */
        if (message.item.type !== 'message') {
          return _this4._queueMessage(message);
        }

        /**
         * Receiving reaction_added event does not mean the bot message was
         * given a reaction, it just mean that someone, somewhere (not even in bot channel)
         * give a reaction. This is madness!
         * We need to validate the message first whether it is written by ourself
         * (bot), or someone else. If it's not bot's own message, skip that shit
         */
        _this4._api.reactions.get({
          channel: message.item.channel,
          timestamp: message.item.ts
        }, function (err, res) {
          if (err || !res.ok || res.message.user !== _this4.bot.id) {
            return;
          }

          _this4._onMessage(message);
        });
      });

      this._rtm.start();
    }

    /**
     * Disconnet from RTM
     *
     * @public
     */

  }, {
    key: 'disconnect',
    value: function disconnect() {
      this._rtm.disconnect();
    }

    /**
     * Handle message object from websocket connection
     *
     * @private
     * @param {Object} msg
     */

  }, {
    key: '_onMessage',
    value: function _onMessage(msg) {
      var _this5 = this;

      var message = new _Message2.default(this.bot, this._dataStore, msg);

      if (!message.from) {
        // ignore invalid message (no sender)
        this.emit(_Events.ROBOT_EVENTS.MESSAGE_NO_SENDER, msg);
        return;
      }

      if (!message.to) {
        this.emit(_Events.ROBOT_EVENTS.MESSAGE_NO_CHANNEL, msg);
        return;
      }

      if (message.from.id === this.bot.id) {
        // ignore own message
        this.emit(_Events.ROBOT_EVENTS.OWN_MESSAGE, message);
        return;
      }

      for (var i = 0; i < this._ignoredChannels.length; i++) {
        if (message.to.name && this._ignoredChannels[i].indexOf(message.to.name) > -1) {
          this.emit(_Events.ROBOT_EVENTS.IGNORED_CHANNEL, message);
          return;
        }
      }

      var listener = this._listeners.find(message);

      if (!listener) {
        this.emit(_Events.ROBOT_EVENTS.NO_LISTENER_MATCH, message);
        return;
      }

      var request = new _Request2.default(message, listener);
      var response = new _Response2.default(this._token, this._dataStore, request, this._vars.concurrency);
      response.on(_Events.RESPONSE_EVENTS.TASK_ERROR, function (err) {
        return _this5.emit(_Events.ROBOT_EVENTS.RESPONSE_FAILED, err);
      });

      this._checkListenerAcl(listener.acls, request, response, function () {
        _this5._handleRequest(request, response, listener.callback);
      });
    }
  }, {
    key: '_checkListenerAcl',
    value: function _checkListenerAcl(acls, request, response, callback) {
      var _this6 = this;

      var acl = acls[0];

      if (!acl) {
        return callback();
      }

      acl(request, response, function () {
        // remove array without affecting original array
        // do not use splice as array is mutable which means
        // original acls will be changed if you use splice
        var nextAcls = acls.filter(function (el, id) {
          return id > 0;
        });
        _this6._checkListenerAcl(nextAcls, request, response, callback);
      });
    }

    /**
     * Handle request
     */

  }, {
    key: '_handleRequest',
    value: function _handleRequest(request, response, callback) {
      var _this7 = this;

      // wrap in "new Promise()"" instead of "Promise.resolve()"
      // because using Promise.resolve won't catch any uncaught
      // exception in listener.callback
      new _bluebird2.default(function (resolve) {
        return resolve(callback(request, response));
      }).then(function () {
        return _this7.emit(_Events.ROBOT_EVENTS.REQUEST_HANDLED, request);
      }).catch(function (err) {
        return _this7.emit(_Events.ROBOT_EVENTS.ERROR, err);
      });
    }

    /**
     * Queue message that have no channel information
     *
     * @private
     * @param {Object} message
     */

  }, {
    key: '_queueMessage',
    value: function _queueMessage(message) {
      var entry = this._getQueueEntry(message);

      // currently we have no way of returning null because
      // we only handle reaction_added event, so this branch
      // is safe to be excluded from code coverage
      /* istanbul ignore if */
      if (!entry) {
        return;
      }

      this._messageQueue.push(entry);
    }

    /**
     * Queue message that have no channel information
     *
     * @private
     * @param {Object} message
     * @return {MessageQueue}
     */

  }, {
    key: '_getQueueEntry',
    value: function _getQueueEntry(message) {
      switch (message.type) {
        case 'reaction_added':
          if (message.item.type === 'file') {
            return {
              id: message.item.file,
              user: message.user,
              type: message.item.type,
              reaction: message.reaction,
              originalType: message.type
            };
          }
          // item.type === 'file_comment'
          return {
            id: message.item.file,
            user: message.user,
            type: message.item.type,
            reaction: message.reaction,
            originalType: message.type
          };
        /* istanbul ignore next */
        default:
          return null;
      }
    }

    /**
     * Find queued message that match current message
     *
     * @private
     * @param {Object} message
     */

  }, {
    key: '_processQueuedMessage',
    value: function _processQueuedMessage(message) {
      for (var i = 0; i < this._messageQueue.length; i++) {
        var entry = this._messageQueue[i];

        // Else statement doesn't do anything anyway so it's not
        // worth covering
        /* istanbul ignore else */
        if (this._isReactionAddEvent(entry, message)) {
          var msg = {
            type: entry.originalType,
            user: entry.user,
            reaction: entry.reaction,
            item: {
              type: 'message',
              channel: message.channel,
              ts: message.message.ts
            },
            eventTs: message.eventTs,
            ts: message.ts
          };
          this._messageQueue.splice(i, 1);
          this._onMessage(msg);
          break;
        }
      }
    }

    /**
     * Check if new message is a complementary for reaction_added event
     *
     * @private
     * @param {MessageQueue} queue
     * @param {SlackMessage} message
     * @return {boolean}
     */

  }, {
    key: '_isReactionAddEvent',
    value: function _isReactionAddEvent(queue, message) {
      /* istanbul ignore else */
      if (message.message.user === this.bot.id && message.message.file && message.message.file.id === queue.id) {
        return true;
      }

      // apparently istanbul doesn't recognize this else pattern
      // so we should add another ignore
      /* istanbul ignore next */
      return false;
    }
  }]);

  return Robot;
}(_eventemitter2.default);

exports.default = Robot;


Robot.EVENTS = _Events.ROBOT_EVENTS;