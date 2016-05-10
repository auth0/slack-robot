'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = dynamicMentionAcl;
function dynamicMentionAcl(req, res, next) {
  if (req.channel.type === 'dm') {
    // no need to mention in direct message
    return next();
  }

  // you need to mention bot in channel / group
  if (req.message.value.mentioned) {
    next();
  }
}