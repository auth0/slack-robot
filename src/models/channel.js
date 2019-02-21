/**
 * {@link https://api.slack.com/types/channel|Channel}
 */

const inherits = require('inherits');

const ChannelGroup = require('./channel-group');

const Channel = function Channel(opts) {
  ChannelGroup.call(this, 'Channel', opts);
};

inherits(Channel, ChannelGroup);

module.exports = Channel;
