'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = helpGenerator;
var FILENAME = 'command-list.txt';
var COMMAND_DESCRIPTION = 'Show this message';

/**
 * @param {Array<Listener>} listeners
 * @return {string}
 */
function generateHelp(listeners) {
  var helpText = '';

  listeners.forEach(function (listener) {
    var listenerType = listener.value instanceof RegExp ? listener.type + ' (regex)' : listener.type;
    var listenerValue = listener.type === 'reaction_added' ? listener.value.toString().replace('\\', '') : listener.value.toString();
    helpText += 'type: ' + listenerType + '\n';
    helpText += 'command: ' + listenerValue + '\n';
    helpText += 'description: ' + (listener.description === '' ? '-' : listener.description) + '\n\n';
  });

  return helpText.trim();
}

var helpListener = void 0;

function helpGenerator(opts) {
  return function plugin(robot) {
    if (opts.enable) {
      helpListener = robot.listen(/help/, function (req, res) {
        var helpText = generateHelp(robot.getAllListeners());
        return res.upload(FILENAME, helpText).send();
      }).desc(COMMAND_DESCRIPTION).acl(robot.acls.dynamicMention);
    } else if (helpListener) {
      robot.removeListener(helpListener.id);
    }
  };
}