/**
 * {@link https://api.slack.com/types/group|Group}
 */

const inherits = require('inherits');

const ChannelGroup = require('./channel-group');

function Group(opts) {
  ChannelGroup.call(this, 'Group', opts);
}

inherits(Group, ChannelGroup);

module.exports = Group;
