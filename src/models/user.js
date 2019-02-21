/**
 *
 */

const inherits = require('inherits');

const Model = require('./model');

function User(opts) {
  Model.call(this, 'User', opts);
}

inherits(User, Model);

module.exports = User;
