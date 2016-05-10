'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Listener = require('./Listener');

var _Listener2 = _interopRequireDefault(_Listener);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Listeners = function () {
  function Listeners() {
    _classCallCheck(this, Listeners);

    this._entries = [];
  }

  /**
   * @public
   * @param {string} type
   * @param {string|RegExp} value
   * @param {function (req, res)} callback
   * @return {Listener} listener
   */


  _createClass(Listeners, [{
    key: 'add',
    value: function add(type, value, callback) {
      var entry = new _Listener2.default(type, value, callback);
      this._entries.push(entry);
      return entry;
    }

    /**
     * @public
     * @param {?string} id
     * @return {Array.<Listener>|?Listener} listener
     */

  }, {
    key: 'get',
    value: function get(id) {
      if (!id) {
        return this._entries;
      }

      for (var i = 0; i < this._entries.length; i++) {
        if (this._entries[i].id === id) {
          return this._entries[i];
        }
      }

      return null;
    }

    /**
     *
     * @public
     * @param {string} id
     * @return {boolean}
     */

  }, {
    key: 'remove',
    value: function remove(id) {
      for (var i = 0; i < this._entries.length; i++) {
        if (this._entries[i].id === id) {
          this._entries.splice(i, 1);
          return true;
        }
      }

      return false;
    }

    /**
     * @public
     * @param {Message} message
     * @return {?Listener} listener
     */

  }, {
    key: 'find',
    value: function find(message) {
      var value = '';
      var type = message.type;

      switch (type) {
        case 'message':
          value = message.value.text;
          break;
        case 'reaction_added':
          value = message.value.emoji;
          break;
        default:
      }

      var entries = this._entries.filter(function (entry) {
        return entry.type === type;
      });

      for (var i = 0; i < entries.length; i++) {
        // get first entry, or first match
        if (!entries[i].matcher || value.match(entries[i].matcher)) {
          return entries[i];
        }
      }

      return null;
    }
  }]);

  return Listeners;
}();

exports.default = Listeners;