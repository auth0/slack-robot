/**
 *
 */

const inherits = require('inherits');

const BaseChannel = require('./base-channel');

const ChannelGroup = function ChannelGroup(name, opts) {
  BaseChannel.call(this, name, opts);
};

inherits(ChannelGroup, BaseChannel);

module.exports = ChannelGroup;
