const expect = require('chai').expect;

const getMemoryDataStore = require('../../utils/client').getMemoryDataStore;
const messageHandlers = require('../../../lib/data-store/message-handlers');

const getRTMMessageFixture = require('../../fixtures').getRTMMessage;

const ALICE_USER_ID = 'U0CJ5PC7L';

describe('RTM API Message Handlers: Presence Events', function () {

  it('should set the user presence when `manual_presence_change` is received', function () {
    const dataStore = getMemoryDataStore();

    messageHandlers.manual_presence_change(
      ALICE_USER_ID, '', dataStore, getRTMMessageFixture('manual_presence_change'));
    const user = dataStore.getUserById(ALICE_USER_ID);
    expect(user.presence).to.equal('away');
  });

  it('should set the user presence when a `presence_change` is received', function () {
    const dataStore = getMemoryDataStore();

    messageHandlers.presence_change(dataStore, getRTMMessageFixture('presence_change'));
    const user = dataStore.getUserById(ALICE_USER_ID);
    expect(user.presence).to.equal('away');
  });

});
