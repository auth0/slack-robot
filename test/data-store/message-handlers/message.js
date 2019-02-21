const expect = require('chai').expect;

const getMemoryDataStore = require('../../utils/client').getMemoryDataStore;
const messageHandlers = require('../../../lib/data-store/message-handlers');

const getRTMMessageFixture = require('../../fixtures').getRTMMessage;

const TEST_CHANNEL_ID = 'C0CJ25PDM';

describe('RTM API Message Handlers: Message Events', function () {

  const testMessageAdd = function (event, baseChannelId, expectedSubtype) {
    const dataStore = getMemoryDataStore();

    messageHandlers['message::rtm_client_add_message'](dataStore, getRTMMessageFixture(event));
    const baseChannel = dataStore.getChannelGroupOrDMById(baseChannelId);

    expect(baseChannel.history[baseChannel.history.length - 1])
      .to.have.property('subtype', expectedSubtype);
    expect(baseChannel.history).to.have.length(2);
  };

  const testBaseChannelJoin = function (event, baseChannelId, expectedUser) {
    const dataStore = getMemoryDataStore();

    messageHandlers[event](dataStore, getRTMMessageFixture(event));
    const baseChannel = dataStore.getChannelGroupOrDMById(baseChannelId);

    expect(baseChannel.members).to.contain(expectedUser);
    expect(baseChannel.history).to.have.length(2);
  };

  const testBaseChannelLeave = function (event, baseChannelId, expectedUser) {
    const dataStore = getMemoryDataStore();

    messageHandlers[event](dataStore, getRTMMessageFixture(event));
    const baseChannel = dataStore.getChannelGroupOrDMById(baseChannelId);

    expect(baseChannel.members).to.not.contain(expectedUser);
    expect(baseChannel.history).to.have.length(2);
  };

  it(
    'adds a user to a channel and updates msg history when a `channel_join` msg is received',
    function () {
      testBaseChannelJoin('message::channel_join', TEST_CHANNEL_ID, 'U0F3LFX6K');
    }
  );

  it(
    'adds a user to a group and updates msg history when a `group_join` msg is received',
    function () {
      testBaseChannelJoin('message::group_join', 'G0CHZSXFW', 'U0F3LFX6K');
    }
  );

  it(
    'removes a user from a channel and updates msg history when a `channel_leave` msg is received',
    function () {
      testBaseChannelLeave('message::channel_leave', TEST_CHANNEL_ID, 'U0F3LFX6K');
    }
  );

  it(
    'removes a user from a group and updates msg history when a `group_leave` msg is received',
    function () {
      testBaseChannelLeave('message::group_leave', 'G0CHZSXFW', 'U0F3LFX6K');
    }
  );

  it('adds to to history when a message without a custom handler is received', function () {
    testMessageAdd('message::channel_archive', TEST_CHANNEL_ID, 'channel_archive');
  });

  it('deletes a message when a `message_delete` message is received', function () {
    const dataStore = getMemoryDataStore();
    const initialMsg = {
      type: 'message',
      channel: 'C0CJ25PDM',
      user: 'U0F3LFX6K',
      text: "I'm going to delete this message Carol",
      ts: '1448496776.000003',
      team: 'T0CHZBU59'
    };
    const channel = dataStore.getChannelById(TEST_CHANNEL_ID);
    channel.addMessage(initialMsg);

    messageHandlers['message::message_deleted'](
      dataStore, getRTMMessageFixture('message::message_deleted'));
    expect(channel.history).to.have.length(2);
    expect(channel.history[1]).to.have.property('subtype', 'message_deleted');
  });

  it('updates a message when a `message_changed` message is received', function () {
    const dataStore = getMemoryDataStore();
    const initialMsg = {
      type: 'message',
      channel: 'C0CJ25PDM',
      user: 'U0F3LFX6K',
      text: 'Howdy Carol',
      ts: '1448496754.000002',
      team: 'T0CHZBU59'
    };
    const channel = dataStore.getChannelById(TEST_CHANNEL_ID);
    channel.addMessage(initialMsg);

    messageHandlers['message::message_changed'](
      dataStore, getRTMMessageFixture('message::message_changed'));
    expect(channel.history).to.have.length(3);
    expect(channel.history[1]).to.have.property('text', 'Hi carol! :simple_smile:');
  });

});
