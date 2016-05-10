'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _nodeUuid = require('node-uuid');

var _nodeUuid2 = _interopRequireDefault(_nodeUuid);

var _util = require('./util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Listener = function () {
  function Listener(type, value, callback) {
    _classCallCheck(this, Listener);

    this.id = _nodeUuid2.default.v4();
    this.type = type;

    this.value = this._parseValue(type, value);
    this.matcher = this._createMatcher(this.value);
    this.callback = callback;
    this.description = '';
    this.acls = [];
  }

  _createClass(Listener, [{
    key: 'desc',
    value: function desc(description) {
      this.description = description;
      return this;
    }
  }, {
    key: 'acl',
    value: function acl() {
      for (var _len = arguments.length, acls = Array(_len), _key = 0; _key < _len; _key++) {
        acls[_key] = arguments[_key];
      }

      this.acls = this.acls.concat(acls);
      return this;
    }
  }, {
    key: '_parseValue',
    value: function _parseValue(type, value) {
      switch (type) {
        case 'message':
          return value;
        case 'reaction_added':
          return (0, _util.stripEmoji)(value).replace('+', '\\+');
        default:
          return value;
      }
    }

    /**
     * Convert value to regular expression for message checking
     *
     * @private
     * @param {?string|RegExp} value
     * @return {RegExp}
     */

  }, {
    key: '_createMatcher',
    value: function _createMatcher(value) {
      if (value instanceof RegExp) {
        return value;
      }

      var expr = value.replace(/:[a-zA-Z]+\(([^\)]*)\)/g, '($1)');
      return new RegExp('^' + expr + '$');
    }
  }]);

  return Listener;
}();

exports.default = Listener;