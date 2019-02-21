/**
 * {@link https://api.slack.com/types/im|DM}
 */

const inherits = require('inherits');

const BaseChannel = require('./base-channel');

function DM(opts) {
  BaseChannel.call(this, 'DM', opts);
}

inherits(DM, BaseChannel);

module.exports = DM;
