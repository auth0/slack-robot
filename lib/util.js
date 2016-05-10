'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.stripEmoji = stripEmoji;
exports.getFileExtension = getFileExtension;
function stripEmoji(emoji) {
  var noTagEmoji = emoji.replace(/:?([^:]+):?/, '$1');
  return noTagEmoji.replace(/:+skin-tone.*/, '');
}

function getFileExtension(filename) {
  return filename.replace(/.*\.([a-z0-9]+)$/, '$1');
}