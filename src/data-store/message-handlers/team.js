/**
 * Handlers for all RTM `team_` events.
 */
const zipObject = require('lodash').zipObject;

const helpers = require('./helpers');


/** {@link https://api.slack.com/events/team_domain_change|team_domain_change} */
const handleTeamDomainChange = function handleTeamDomainChange(
  activeUserId, activeTeamId, dataStore, message) {
  const team = dataStore.getTeamById(activeTeamId);
  team.domain = message.domain;
  team.url = message.url;
  dataStore.setTeam(team);
};


/** {@link https://api.slack.com/events/team_rename|team_rename} */
const handleTeamRename = function handleTeamRename(activeUserId, activeTeamId, dataStore, message) {
  const team = dataStore.getTeamById(activeTeamId);
  team.name = message.name;
  dataStore.setTeam(team);
};


/** {@link https://api.slack.com/events/team_pref_change|team_pref_change} */
const handleTeamPrefChange = function handleTeamPrefChange(
  activeUserId, activeTeamId, dataStore, message) {
  const team = dataStore.getTeamById(activeTeamId);
  team.prefs[message.name] = message.value;
  dataStore.setTeam(team);
};


const handlers = [
  ['team_domain_change', handleTeamDomainChange],
  ['team_rename', handleTeamRename],
  ['team_pref_change', handleTeamPrefChange],
  ['team_join', helpers.handleNewOrUpdatedUser]
];


module.exports = zipObject(handlers);
