/**
 *
 */

const inherits = require('inherits');

const ChannelGroup = require('./channel-group');

function MPDM(opts) {
  ChannelGroup.call(this, 'MPDM', opts);
}

inherits(MPDM, ChannelGroup);

module.exports = MPDM;
