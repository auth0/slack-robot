const expect = require('chai').expect;

const getMemoryDataStore = require('../../utils/client').getMemoryDataStore;
const messageHandlers = require('../../../lib/data-store/message-handlers');

const getRTMMessageFixture = require('../../fixtures').getRTMMessage;

const ALICE_USER_ID = 'U0CJ5PC7L';
const GENERAL_CHANNEL_ID = 'C0CHZA86Q';


describe('RTM API Message Handlers: User Events', function () {

  it('updates a user preference when `pref_change` is received', function () {
    const dataStore = getMemoryDataStore();
    const prefChangeMsg = getRTMMessageFixture('pref_change');

    messageHandlers.pref_change(ALICE_USER_ID, '', dataStore, prefChangeMsg);
    const user = dataStore.getUserById(ALICE_USER_ID);
    expect(user.prefs[prefChangeMsg.name]).to.equal(prefChangeMsg.value);
  });

  it('updates a channel, marking a user as typing when `user_typing` is received', function () {
    const dataStore = getMemoryDataStore();
    const channel = dataStore.getChannelById(GENERAL_CHANNEL_ID);
    const userTypingMsg = getRTMMessageFixture('user_typing');
    messageHandlers.user_typing(dataStore, userTypingMsg);

    expect(channel._typing[userTypingMsg.user]).to.not.equal(undefined);
  });

  it('adds or updates a user when a `user_change` event is received', function () {
    const dataStore = getMemoryDataStore();

    messageHandlers.user_change(dataStore, getRTMMessageFixture('user_change'));
    const user = dataStore.getUserById('U0CJ1TWKX');
    expect(user.profile.email).to.equal('leah+slack-api-test-user-change-test@slack-corp.com');
  });

});
