var EventEmitter = require('events').EventEmitter;
var lodash = require('lodash');
var sinon = require('sinon');

var MemoryDataStore = require('../../lib/data-store').MemoryDataStore;
var rtmStartFixture = require('../fixtures/rtm.start.json');


var getMemoryDataStore = function getMemoryDataStore() {
  var dataStore = new MemoryDataStore();
  dataStore.cacheRtmStart(lodash.cloneDeep(rtmStartFixture));
  return dataStore;
};


module.exports.getMemoryDataStore = getMemoryDataStore;
