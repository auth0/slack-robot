const expect = require('chai').expect;

const getMemoryDataStore = require('../../utils/client').getMemoryDataStore;
const messageHandlers = require('../../../lib/data-store/message-handlers');
const models = require('../../../lib/models');

const getRTMMessageFixture = require('../../fixtures').getRTMMessage;


describe('RTM API Message Handlers: Team Events', function () {

  it('updates the team domain when a `team_domain_change` message is received', function () {
    const dataStore = getMemoryDataStore();

    messageHandlers.team_domain_change(
      '', 'T0CHZBU59', dataStore, getRTMMessageFixture('team_domain_change'));
    const team = dataStore.getTeamById('T0CHZBU59');

    expect(team.url).to.equal('https://sslack-api-test.slack.com');
    expect(team.domain).to.equal('sslack-api-test');
  });

  it('updates the team name when a `team_rename` message is received', function () {
    const dataStore = getMemoryDataStore();

    messageHandlers.team_rename('', 'T0CHZBU59', dataStore, getRTMMessageFixture('team_rename'));
    const team = dataStore.getTeamById('T0CHZBU59');

    expect(team.name).to.equal('slack-api-test-test');
  });

  it('updates a team preference when a `team_pref_change` message is received', function () {
    const dataStore = getMemoryDataStore();
    const prefChangeMsg = getRTMMessageFixture('team_pref_change');

    messageHandlers.team_pref_change('', 'T0CHZBU59', dataStore, prefChangeMsg);
    const team = dataStore.getTeamById('T0CHZBU59');
    expect(team.prefs[prefChangeMsg.name]).to.equal(prefChangeMsg.value);
  });

  it('adds a new user to a team when a `team_join` message is received', function () {
    const dataStore = getMemoryDataStore();
    const teamJoinMsg = getRTMMessageFixture('team_join');

    messageHandlers.team_join(dataStore, teamJoinMsg);
    const user = dataStore.getUserById('U0EV582MU');

    expect(user).to.be.an.instanceof(models.User);
  });

});
