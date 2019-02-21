const expect = require('chai').expect;
const sinon = require('sinon');

const getMemoryDataStore = require('../utils/client').getMemoryDataStore;
const getRTMMessageFixture = require('../fixtures').getRTMMessage;
const makeMessageEventWithSubtype = (subtype, delim) => {
  return ['message', subtype].join(delim || '::');
};

describe('DataStore', function () {

  describe('#handleRtmMessage()', function () {

    const testMessageHandler = function testMessageHandler(eventType, isMsg, optExpectedHandlerType) {
      const dataStore = getMemoryDataStore();
      sinon.spy(dataStore._messageHandlers, optExpectedHandlerType || eventType);

      dataStore.handleRtmMessage(
        '', '', isMsg ? 'message' : eventType, getRTMMessageFixture(eventType));
      expect(dataStore._messageHandlers[optExpectedHandlerType || eventType].calledOnce)
        .to.equal(true);
    };

    it('calls the message handler for non-message events', function () {
      testMessageHandler('presence_change');
    });

    it('calls the message::subtype handler for messages with a subtype handler', function () {
      testMessageHandler(makeMessageEventWithSubtype('message_deleted'), true);
    });

    it('calls the `rtm_client_add_message` handler for msgs with no subtype handler', function () {
      testMessageHandler(
        makeMessageEventWithSubtype('group_name'),
        true,
        makeMessageEventWithSubtype('rtm_client_add_message')
      );
    });

  });

});
